
var models = require('../models');

/*jslint node: true */

exports.default = function(req, res) {
    "use strict";
	res.render('default.html');
};

exports.index = function (req, res) {
    "use strict";
	res.render('index.html', { message: req.flash('indexMessage') });
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

exports.logon = function (req) {
    "use strict";
    req.passport.authenticate('local', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
    });
};

exports.login = function (req, res) {
    "use strict";
    res.render('login.html', { message: req.flash('loginMessage') });
};

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

