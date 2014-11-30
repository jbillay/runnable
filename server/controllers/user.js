
/*jslint node: true */

var User = require('../objects/user');
var Mail = require('../objects/mail');

exports.create = function(req, res) {
    "use strict";
	var html,
		text,
		mail = new Mail();
	console.log('Add user : ' + req.body.user.email);
	if (req.body.user.password === req.body.user.password_confirmation) {
		var user = new User();
		user.set(req.body.user);
		user.save(function (err, newUser) {
			if (err) {
				console.log('Account not created ' + err);
				req.flash('indexMessage',
					"Désolé votre compte n'a pas pu être créé car votre adresse email existe déjà !");
				res.redirect('/');
			} else {
				console.log('Account created');
				req.flash('indexMessage', "Vous allez recevoir un email pour l'activation de votre compte!");
				user.getItraCode(function (err, code) {
					newUser.itra = code;
					newUser.save();
				});
				mail.setTo(user.email);
				mail.setSubject("Activation de votre compte runnable");
				html = "Vous venez de créer un compte sur notre site runnable<br/>" +
					"Pour l'activer veuillez cliquer sur le lien suivant :<br/>" +
					"http://localhost:9615/api/active/" + newUser.id + "/" + newUser.hashedPassword +
					"<br/> Merci l'intérêt que vous porter à notre site";
				text = "Vous venez de créer un compte sur notre site runnable. " +
					"Pour l'activer veuillez copiez/coller le lien suivant dans votre navigateur" +
					"http://localhost:9615/api/active/" + newUser.id + "/" + newUser.hashedPassword +
					" Merci l'intérêt que vous porter à notre site";
				mail.setContentHtml(html);
				mail.setText(text);
				mail.send();
				res.redirect('/');
			}
		});
	} else {
		console.log('Problem de mot de passe');
		req.flash('indexMessage', "Attention, les deux mots de passe sont différents");
		res.redirect('/');
	}
};

exports.active = function(req, res) {
	"user strict";
	console.log('Try to activate account ' + req.params.id);
	var user = new User();
	user.activate(req.params.id, req.params.hash, function (err) {
		if (err) {
			req.flash('indexMessage', "Votre compte n'a pas pu être activé");
			res.redirect('/');
		}
		req.flash('indexMessage', "Votre compte vient d'être activé");
		res.redirect('/');
	});
};

exports.me = function(req, res) {
	"user strict";
	res.jsonp(req.user || null);
};

exports.showRuns = function(req, res) {
	"user strict";
	var user = new User();
	user.getRuns(req.user, function (err, runs) {
		res.jsonp(runs);
	});
};