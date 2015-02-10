
var models = require('../models');
var Mail = require('../objects/mail');
var _ = require('lodash');

/*jslint node: true */

exports.default = function(req, res) {
    "use strict";
	res.render('default.html');
};

exports.partials = function (req, res) {
    "use strict";
    var name = req.params.name;
    res.render('partials/' + name + '.html');
};

exports.logout = function (req, res) {
    "use strict";
    req.logout();
    res.redirect('/');
};

/*
exports.logon = function (req) {
    "use strict";
    req.passport.authenticate('local', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
    });
};
*/

exports.auth = function (req, res) {
    "use strict";
	res.jsonp(req.user || null);
};

// for dev purpose only -- To be removed
exports.sync = function (req, res) {
    "use strict";
	models.sequelize.sync({force: true})
        .then(function() {
            console.log("New database created !");
        })
        .catch(function (err) {
			console.log('Error on sync db : ' + err);
		});
	res.redirect('/');
};

exports.sendMail = function (req, res) {
    'use strict';
    var html,
        text,
        emails = [],
        confirmation = req.body.confirm,
        mail = new Mail();
    emails = req.body.emails.split(",");
    emails = _.compact(emails);
    emails.forEach(function(email) {
        email = email.trim();
        mail.setTo(email);
        mail.setSubject(req.body.title);
        html = req.body.message;
        text = req.body.message;
        mail.setContentHtml(html);
        mail.setText(text);
        mail.send();
        console.log('Mail sent to : ' + email);
    });
    res.jsonp('{"msg": "' + confirmation + '", "type": "success"}');
};