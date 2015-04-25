/**
 * Created by jeremy on 27/03/2015.
 */
 
var Options = require('../objects/option');

exports.getOption = function (req, res) {
    'use strict';
    var name = req.params.name;
	var value = res.locals.options[name];
    console.log('Get option ' + name);
    res.json(value);
};

exports.getOptions = function (req, res) {
    'use strict';
    console.log('Get all options');
	res.json(res.locals.options);
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
