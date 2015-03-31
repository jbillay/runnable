/* option object */

var models = require('../models');
var q = require('q');

function Options() {
    'use strict';
    this.emailTemplate = null;
    this.mailConfig = null;
}

Options.prototype.get = function (name) {
    'use strict';
    var deferred = q.defer();
    models.Options.find({where: {name: name}})
        .then(function (option) {
            if (!option) {
                deferred.reject(new Error('Option not found'));
            } else {
                deferred.resolve(option.value);
            }
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

Options.prototype.load = function (done) {
	'use strict';
	var that = this;
	models.Options.findAll()
		.then(function (options) {
			options.forEach(function (opt) {
				var funcName = 'set';
				funcName += opt.name[0].toUpperCase() + opt.name.substring(1);
				if (Options.prototype.hasOwnProperty(funcName)) {
					that[funcName](JSON.parse(opt.value));
				}
			}, that);
			done(null, that);
		})
		.catch(function (err) {
			done(err, null);
		});
};

Options.prototype.save = function (newOptions, done) {
	'use strict';
	var mailConfig = newOptions[0],
		emailTemplate = newOptions[1];
	models.Options.findAll()
		.then(function (options) {
			options.forEach(function (option) {
				if (eval(option.name) !== null) {
					option.updateAttributes({value: JSON.stringify(eval(option.name))})
						.then(function (savedOption) {
							console.log('Option ' + savedOption.name + ' changed !');
						})
						.catch(function (err) {
							console.log('No able to save option ' + option.name + ' due to ' + err);
						});
				}
			});
			done(null, options);
		})
		.catch(function (err) {
			done(err, null);
		});
};

Options.prototype.setEmailTemplate = function (value) {
    'use strict';
    this.emailTemplate = value;
};

Options.prototype.getTemplateId = function (name) {
    'use strict';
    var id = null;

    this.emailTemplate.forEach(function (template) {
        if (template.name === name) {
            id = template.id;
        }
    }, this);
    return id;
};

Options.prototype.getEmailTemplate = function (id) {
    'use strict';
    var html = null;

    this.emailTemplate.forEach(function (template) {
        if (template.id === id) {
            html = template.html;
        }
    }, this);
    return html;
};

Options.prototype.setMailConfig = function (value) {
    'use strict';
    this.mailConfig = value;
};

Options.prototype.getMailConfig = function () {
    'use strict';
    return this.mailConfig;
};

module.exports = Options;