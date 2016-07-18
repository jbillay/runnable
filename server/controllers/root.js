
var models = require('../models');
var Mail = require('../objects/mail');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');

/*jslint node: true */

exports.default = function(req, res) {
    'use strict';
	res.render('default.html');
};

exports.partials = function (req, res) {
    'use strict';
    var name = req.params.name;
    res.render('partials/' + name + '.html');
};

exports.logout = function (req, res) {
    'use strict';
    req.logout();
    return res.jsonp({msg: 'userLogoff', type: 'success'});
};

exports.auth = function (req, res) {
    'use strict';
	res.jsonp(req.user || null);
};

// for dev purpose only -- To be removed
exports.sync = function (req, res) {
    'use strict';
    if (process.env.NODE_ENV !== 'production') {
        models.sequelize.sync({force: true})
            .then(function () {
                console.log('New database created !');
            })
            .catch(function (err) {
                console.log('Error on sync db : ' + err);
            });
    }
	res.redirect('/');
};

exports.version = function (req, res) {
    'use strict';
    fs.readFile(path.normalize(path.join(__dirname, '../../.version')), 'utf8', function (err, data) {
        if (err) {
            console.log('[ERROR] Version file : ' + err);
            res.json('Version not defined');
        } else {
            res.json(data);
        }
        err = null;
        data = null;
    });
};

exports.fileParser = function (req, res, next) {
    'use strict';
    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        if (err) {
            next();
        } else {
            req.files = files;
            req.fields = fields;
            next();
        }
    });
};

exports.sendMail = function (req, res) {
    'use strict';
    var html,
        text,
        emails = [],
        confirmation = req.body.confirm,
        mail = new Mail();
    emails = req.body.emails.split(',');
    emails = _.compact(emails);
    mail.init().then(function () {
        emails.forEach(function(email) {
            email = email.trim();
            mail.setTo(email);
            mail.setSubject(req.body.title);
            html = req.body.message;
            text = req.body.message;
            mail.setContentHtml(html);
            mail.setText(text);
            mail.send().done();
            console.log('Mail sent to : ' + email);
        });
        res.jsonp({msg: confirmation, type: 'success'});
    });
};

exports.sendTestMail = function (req, res) {
    'use strict';

    var templateName = req.body.template.name || 'mailTest',
        values = req.body.template.values || {},
        email = req.body.template.email || 'jbillay@gmail.com',
        mail = new Mail();

    mail.sendEmail(templateName, values, email)
        .then(function (message) {
            return res.jsonp({msg: message, type: 'success'});
        });
};