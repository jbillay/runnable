
/*jslint node: true */

var User = require('../objects/user');

exports.create = function(req, res) {
    "use strict";
	console.log('Add user : ' + req.body.user.email);
	if (req.body.user.password === req.body.user.password_confirmation) {
		var user = new User();
		user.set(req.body.user);
		user.save(function (err, user) {
			if (err) {
				console.log('Account not created ' + err);
				req.flash('indexMessage',
					"Désolé votre compte n'a pas pu être créé car votre adresse email existe déjà !");
				res.redirect('/');
			} else {
				console.log('Account created');
				req.flash('indexMessage', 'Votre compte a bien été créé, vous pouvez dès maintenant vous connecter !');
				res.redirect('/');
			}
		});
	} else {
		console.log('Problem de mot de passe');
		req.flash('indexMessage', "Attention, les deux mots de passe sont différents");
		res.redirect('/');
	}
};

exports.me = function(req, res) {
	"user strict";
	res.jsonp(req.user || null);
};
