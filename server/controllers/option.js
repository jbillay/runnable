/**
 * Created by jeremy on 27/03/2015.
 */
 
var Options = require('../objects/option');

exports.getOption = function (req, res) {
    'use strict';
    var name = req.params.name,
        options = new Options();
    console.log('Get option ' + name);
    options.get(name)
        .then(function (value) {
            res.jsonp(value);
            value = null;
        })
        .catch(function (err) {
            res.jsonp({msg: err, type: 'error'});
        });
    name = null;
    options = null;
};

exports.getOptions = function (req, res) {
    'use strict';
    var options = new Options();
    console.log('Get all options');
    options.load(function (err, values) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(values);
        }
    });
};

exports.saveOptions = function (req, res) {
    'use strict';
    var modOptions = req.body,
        emailTemplate = modOptions.emailTemplate,
        mailConfig = modOptions.mailConfig,
		options = new Options();
    options.save(modOptions, function (err, options) {
        if (err) {
            console.log(new Error('Not enable to get option : ' + err));
            res.jsonp({msg: 'emailOptionsNotSaved', type: 'error'});
        } else {
			res.jsonp({msg: 'emailOptionsSaved', type: 'success'});
		}
    });
};
