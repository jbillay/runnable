
var db = require('../models');

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
        successRedirect : '/home',
        failureRedirect : '/login',
        failureFlash : true
    });
};

exports.login = function (req, res) {
    "use strict";
    res.render('login.html', { message: req.flash('loginMessage') });
};

// for dev purpose only -- To be removed
exports.sync = function (req, res) {
    "use strict";
	global.db.drop(function (err) {
		if (err) {
			console.log('Error on sync db : ' + err);
		}
		!err && console.log("Database no longer exists!");
		global.db.sync(function (err) {
			if (err) {
				console.log('Error on sync db : ' + err);
			}
			!err && console.log("New database created !");
		});
	});
	res.redirect('/');
};

