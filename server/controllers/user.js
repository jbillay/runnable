
/*jslint node: true */

var settings = require('../../conf/config');
var User = require('../objects/user');
var Mail = require('../objects/mail');
var Journey = require('../objects/journey');
var Join = require('../objects/join');
var _ = require('lodash');

exports.remove = function(req, res) {
    'use strict';
    var userId = req.body.id,
        user = new User();
    user.delete(userId, function (err, msg) {
        if (err) {
            console.log('user account not deleted');
            res.jsonp('{"msg": "userNotDeleted", "type": "error"}');
        } else {
            console.log('user account deleted');
            res.jsonp('{"msg": "userDeleted", "type": "success"}');
        }
    });
};

exports.invite = function(req, res) {
	'use strict';
	var html,
		text,
		emails = [],
		mail = new Mail();
	emails = req.body.emails.split(',');
	emails = _.compact(emails);
	emails.forEach(function(email) {
		email = email.trim();
		mail.setTo(email);
		mail.setSubject('Rejoins moi sur My Run Trip');
		html = req.body.message;
		text = req.body.message;
		mail.setContentHtml(html);
		mail.setText(text);
		mail.send();
		console.log('Invite sent to : ' + email);
	});
	res.jsonp('{"msg": "Invitation(s) envoyée(s)"}');
};

exports.update = function(req, res) {
    'use strict';
    var user = new User();
    console.log(req.body);
    user.update(req.user.id, req.body, function (err, selectedUser) {
        if (err) {
            console.log('Account not updated ' + err);
            res.jsonp('{"msg": "notUpdatedAccount", "type": "error"}');
        } else {
            console.log('Account updated !');
            res.jsonp('{"msg": "accountUpdated", "type": "success"}');
        }
    });
};

exports.create = function(req, res) {
    'use strict';
	var html,
		text,
		mail = new Mail();
	console.log('Add user : ' + req.body.email);
	if (req.body.password === req.body.password_confirmation) {
		var user = new User();
		user.set(req.body);
		user.save(function (err, newUser) {
			if (err) {
				console.log('Account not created ' + err);
				res.jsonp('{"msg": "existingAccount", "type": "error"}');
			} else {
				console.log('Account created');
				user.getItraCode(newUser, function (err, code) {
					if (err) {
						console.log('ITRA cannot be retrieve');
					} else {
                        console.log('ITRA code is : ' + code);
                    }
				});
				var url = settings.domain,
					timekey = new Date(newUser.createdAt).getTime();
				mail.setTo(user.email);
				mail.setSubject('Activation de votre compte runnable');
				html = 'Vous venez de créer un compte sur notre site runnable<br/>' +
					'Pour l\'activer veuillez cliquer sur le lien suivant :<br/>' +
					'http://' + url + '/api/user/active/' + newUser.id + '/' + timekey +
					'<br/> Merci l\'intérêt que vous porter à notre site';
				text = 'Vous venez de créer un compte sur notre site runnable. ' +
					'Pour l\'activer veuillez copiez/coller le lien suivant dans votre navigateur' +
					'http://' + url + '/api/user/active/' + newUser.id + '/' + timekey +
					' Merci l\'intérêt que vous porter à notre site';
				mail.setContentHtml(html);
				mail.setText(text);
				mail.send();
				res.jsonp('{"msg": "accountCreated", "type": "success"}');
			}
		});
	} else {
		console.log('Two passwords are different');
		res.jsonp('{"msg": "wrongPassword", "type": "error"}');
	}
};

exports.me = function(req, res) {
	'use strict';
	req.user.salt = req.user.hashedPassword = req.user.provider = null;
	res.jsonp(req.user || null);
};

exports.showRuns = function(req, res) {
	'use strict';
	var user = new User();
	var currentUser = req.user;
	user.getRuns(currentUser, function (err, runs) {
		if (err) {
			res.jsonp('Impossible de récupérer les informations sur le site i-tra.org');
		} else {
			res.jsonp(runs);
		}
	});
};

exports.showJourneys = function (req, res) {
	'use strict';
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
	'use strict';
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
var createPassword = function (size, phrase) {
    'use strict';
	var index = (Math.random() * (phrase.length - 1)).toFixed(0);
	return size > 0 ? phrase[index] + createPassword(size - 1, phrase) : '';
};

exports.resetPassword = function (req, res) {
	'use strict';
	var email = req.body.email,
		password = createPassword(8, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890#{[@]}&"(-_)=+/-*'),
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
			mail.setSubject('Génération d\'un nouveau mot de passe pour votre compte MyRunTrip');
			html = 'Vous venez de demander la génération d\'un nouveau mot de passe sur notre site MyRunTrip.fr<br/>' +
				'Voici votre nouveau mot de passe :' + password + '<br/>' +
				'<br/> Merci l\'intérêt que vous porter à notre site';
			text = 'Vous venez de demander la génération d\'un nouveau mot de passe sur notre site MyRunTrip.fr. ' +
					'Voici votre nouveau mot de passe :' + password + '.' +
                    ' Merci l\'intérêt que vous porter à notre site';
			mail.setContentHtml(html);
			mail.setText(text);
			mail.send();
			res.redirect('/');
		}
	});
};

exports.updatePassword = function (req, res) {
	'use strict';
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
			} else {
                console.log('new passwords are differents');
                res.jsonp('{"msg": "passwordDifferent", "type": "error"}');
            }
		}
	});
};

exports.list = function(req, res) {
	'use strict';
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
	'use strict';
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
	'use strict';
	console.log('Try to activate account ' + req.params.id);
	var user = new User();
	user.activate(req.params.id, req.params.hash, function (err, data) {
		if (err) {
			res.redirect('/');
		}
		res.redirect('/');
	});
};

exports.publicInfo = function (req, res) {
	'use strict';
	var userId = req.params.id,
		user = new User();
	user.getPublicInfo(userId, function(err, user) {
		if (err) {
			console.log('[ERROR] Not able to user public info: ' + err);
			res.jsonp('{"msg": ' + err + ', "type": "error"}');
		} else {
			res.jsonp(user);
		}
	});
};

exports.publicDriverInfo = function (req, res) {
    'use strict';
    var userId = req.params.id,
        user = new User();
    user.getPublicDriverInfo(userId, function(err, feedback) {
        if (err) {
            console.log('[ERROR] Not able to user public info: ' + err);
            res.jsonp('{"msg": ' + err + ', "type": "error"}');
        } else {
            res.jsonp(feedback);
        }
    });
};