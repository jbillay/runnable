
/*jslint node: true */

var User = require('../objects/user');
var Mail = require('../objects/mail');
var Journey = require('../objects/journey');
var Join = require('../objects/join');

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
					if (err) {
						console.log('ITRA cannot be retrieve');
					} else {
						newUser.itra = code;
						newUser.save();
					}
				});
				var url = req.get('host');
				mail.setTo(user.email);
				mail.setSubject("Activation de votre compte runnable");
				html = "Vous venez de créer un compte sur notre site runnable<br/>" +
					"Pour l'activer veuillez cliquer sur le lien suivant :<br/>" +
					"http://" + url + "/api/user/active/" + newUser.id + "/" + newUser.hashedPassword +
					"<br/> Merci l'intérêt que vous porter à notre site";
				text = "Vous venez de créer un compte sur notre site runnable. " +
					"Pour l'activer veuillez copiez/coller le lien suivant dans votre navigateur" +
					"http://" + url + "/api/user/active/" + newUser.id + "/" + newUser.hashedPassword +
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

exports.me = function(req, res) {
	"use strict";
	req.user.salt = req.user.hashedPassword = req.user.provider = null;
	res.jsonp(req.user || null);
};

exports.showRuns = function(req, res) {
	"use strict";
	var user = new User();
	user.getRuns(req.user, function (err, runs) {
		if (err) {
			res.jsonp('Impossible de récupérer les informations sur le site i-tra.org');
		} else {
			res.jsonp(runs);
		}
	});
};

exports.showJourneys = function (req, res) {
	"use strict";
	var id = req.user.id;
	var journey = new Journey();
	journey.getByUser(id, function (err, journeyList) {
		if (err) {
			console.log('Not able to get user journey : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			res.jsonp(journeyList);
		}
	});
};

exports.showJoins = function (req, res) {
	"use strict";
	var id = req.user.id;
	var join = new Join();
	join.getByUser(id, function (err, joinList) {
		if (err) {
			console.log('Not able to get user join : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else {
			res.jsonp(joinList);
		}
	});
};

// should be in a tool file
createMdp = function (size, phrase) {
	var index = (Math.random() * (phrase.length - 1)).toFixed(0);
	return size > 0 ? phrase[index] + createMdp(size - 1, phrase) : '';
};

exports.resetPassword = function (req, res) {
	"use strict";
	var email = req.body.email,
		password = createMdp(8, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890#{[\@]}&"(-_)=+/-*'),
		html,
		text,
		mail = new Mail();
	var user = new User();
	user.updatePassword(email, password, function (err, newUser) {
		if (err) {
			console.log('Not able to reset password : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else { 
			mail.setTo(newUser.email);
			mail.setSubject("Génération d'un nouveau mot de passe pour votre compte MyRunTrip");
			html = "Vous venez de demander la génération d'un nouveau mot de passe sur notre site MyRunTrip.fr<br/>" +
				"Voici votre nouveau mot de passe :" + password + "<br/>" +
				"<br/> Merci l'intérêt que vous porter à notre site";
			text = "Vous venez de demander la génération d'un nouveau mot de passe sur notre site MyRunTrip.fr. " +
					"Voici votre nouveau mot de passe :" + password + "." +
					" Merci l'intérêt que vous porter à notre site";
			mail.setContentHtml(html);
			mail.setText(text);
			mail.send();
			res.redirect('/');
		}
	});
};

exports.updatePassword = function (req, res) {
	"use strict";
	var oldPassword = req.body.passwords.old,
		newPassword = req.body.passwords.new,
		newPasswordConfirm = req.body.passwords.newConfirm,
		user = new User();
	user.getByEmail(req.user.email, function (err, currentUser) {
		if (err) {
			res.jsonp('{"msg": ' + err + ', "type": "error"}');
		} else if (!currentUser) {
			console.log('User does not exist');
			res.jsonp('{"msg": "userUnknow", "type": "error"}');
		} else if (!currentUser.authenticate(oldPassword)) {
			console.log('Old password not good');
			res.jsonp('{"msg": "passwordWrong", "type": "error"}');
		} else if (currentUser.authenticate(oldPassword)) {
			if (newPassword === newPasswordConfirm) {
				user.updatePassword(req.user.email, newPassword, function (err, newUser) {
					if (err) {
						console.log('Not able to reset password : ' + err);
						res.jsonp('{"msg": ' + err + ', "type": "error"}');
					} else { 
						console.log('Password reseted');
						res.jsonp('{"msg": "passwordUpdated", "type": "success"}');
					}
				});
			}
		}
	});
};

exports.list = function(req, res) {
	"use strict";
	var user = new User();
	user.getList(function (err, users) {
		if (err) {
			console.log('Not able to get user list : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else {
			res.jsonp(users);
		}
	});
};

exports.toggleActive = function (req, res) {
	"use strict";
	console.log('Toggle active for user ' + req.body.id);
	var id = req.body.id,
		user = new User();
	user.toggleActive(id, function (err) {
		if (err) {
			console.log('Not able to toggle active flag for user : ' + err);
			res.jsonp('{"msg": ' + err + ', "type": "error"}');
		} else {
			res.jsonp('{"msg": "userToggleActive", "type": "success"}');
		}
	});
};

exports.active = function(req, res) {
	"use strict";
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

exports.toggleAdmin = function (req, res) {
	"use strict";
	console.log('Toggle admin for user ' + req.body.id);
	var id = req.body.id,
		user = new User();
	user.toggleAdmin(id, function (err) {
		if (err) {
			console.log('Not able to toggle admin flag for user : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else {
			res.jsonp('{"msg": "done"}');
		}
	});
};