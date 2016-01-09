
/*jslint node: true */

var settings = require('../../conf/config');
var User = require('../objects/user');
var Mail = require('../objects/mail');
var Journey = require('../objects/journey');
var Join = require('../objects/join');
var _ = require('lodash');
var jwt = require('jsonwebtoken');

exports.remove = function(req, res) {
    'use strict';
    var userId = req.body.id,
        user = new User();
    user.delete(userId, function (err, msg) {
        if (err) {
            console.log('user account not deleted');
            res.jsonp({msg: 'userNotDeleted', type: 'error'});
        } else {
            console.log('user account deleted');
            res.jsonp({msg: 'userDeleted', type: 'success'});
        }
		err = null;
		msg = null;
    });
	userId = null;
	user = null;
};

exports.invite = function(req, res) {
	'use strict';
	var emails,
        mail = new Mail();
	emails = req.body.emails.split(',');
	emails = _.compact(emails);
    mail.init().then(function () {
        emails.forEach(function(email) {
            var html,
                text;
            email = email.trim();
            mail.setTo(email);
            mail.setSubject('Rejoins moi sur My Run Trip');
            html = req.body.message;
            text = req.body.message;
            mail.setContentHtml(html);
            mail.setText(text);
            mail.send().done();
            console.log('Invite sent to : ' + email);
        });
        res.jsonp({msg: 'Invitation(s) envoyée(s)'});
        emails = null;
    });
};

exports.update = function(req, res) {
    'use strict';
    var user = new User();
    user.update(req.user.id, req.body, function (err, selectedUser) {
        if (err) {
            console.log('Account not updated ' + err);
            res.jsonp({msg: 'notUpdatedAccount', type: 'error'});
        } else {
            console.log('Account updated !');
            res.jsonp({msg: 'accountUpdated', type: 'success'});
        }
		err = null;
		selectedUser = null;
    });
	user = null;
};

exports.create = function(req, res) {
    'use strict';
    var mail = new Mail();
	console.log('Add user : ' + req.body.email);
	if (req.body.password === req.body.password_confirmation) {
		var user = new User();
		user.set(req.body);
		user.save(function (err, newUser) {
			if (err) {
				console.log('Account not created ' + err);
				return res.jsonp({msg: 'existingAccount', type: 'error'});
			} else {
				console.log('Account created');
				user.getItraCode(newUser, function (err, code) {
					if (err) {
						console.log('ITRA cannot be retrieve');
					} else {
                        console.log('ITRA code is : ' + code);
                    }
                });
				var url = settings.domain;
                mail.sendEmail('NewAccount', {url: url}, user.email).done();
                var token = jwt.sign(newUser, 'secretTokenKey4MyRunTrip$', {
                    expiresIn: 86400 // expires in 24 hours
                });
                newUser.token = token;
                req.logIn(newUser, function(err) {
                    if (err) { console.log(err); }
                    return res.jsonp({msg: newUser, type: 'success', token: newUser.token});
                });
            }
		});
	} else {
		console.log('Two passwords are different');
		return res.jsonp({msg: 'wrongPassword', type: 'error'});
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
		err = null;
		runs = null;
	});
	currentUser = null;
	user = null;
};

exports.showJourneys = function (req, res) {
	'use strict';
	var id = req.user.id;
	var journey = new Journey();
	journey.getByUser(id, function (err, journeyList) {
		if (err) {
			console.log('Not able to get user journey : ' + err);
			return res.jsonp({msg: 'Not able to get user journey', type: 'error'});
		} else {
			return res.jsonp(journeyList);
		}
		err = null;
	});
	id = null;
	journey = null;
};

exports.showJoins = function (req, res) {
	'use strict';
	var id = req.user.id;
	var join = new Join();
	join.getByUser(id, function (err, joinList) {
		if (err) {
			console.log('Not able to get user join : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(joinList);
		}
		err = null;
		joinList = null;
	});
	id = null;
	join = null;
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
        user = new User(),
        mail = new Mail();

	user.updatePassword(email, password, function (err, newUser) {
		if (err) {
			console.log('Not able to reset password : ' + err);
			res.jsonp({msg: 'passwordNotReset', type: 'error'});
		} else {
            mail.sendEmail('ResetPassword', {password: password}, newUser.email)
                .then(function (msg) {
                    res.jsonp({msg: 'passwordReset', type: 'success'});
                })
                .catch(function (err) {
                    res.jsonp({msg: err, type: 'error'});
                });
		}
	});
	user = null;
};

exports.updatePassword = function (req, res) {
	'use strict';
	var oldPassword = req.body.passwords.old,
		newPassword = req.body.passwords.new,
		newPasswordConfirm = req.body.passwords.newConfirm,
		user = new User();
	user.getByEmail(req.user.email, function (err, currentUser) {
		if (err) {
			res.jsonp({msg: err, type: 'error'});
		} else if (!currentUser) {
			console.log('User does not exist');
			res.jsonp({msg: 'userUnknow', type: 'error'});
		} else if (!currentUser.authenticate(oldPassword)) {
			console.log('Old password not good');
			res.jsonp({msg: 'passwordWrong', type: 'error'});
		} else if (currentUser.authenticate(oldPassword)) {
			if (newPassword === newPasswordConfirm) {
				user.updatePassword(req.user.email, newPassword, function (err, newUser) {
					if (err) {
						console.log('Not able to reset password : ' + err);
						res.jsonp({msg: err, type: 'error'});
					} else { 
						console.log('Password reseted');
						res.jsonp({msg: 'passwordUpdated', type: 'success'});
					}
					err = null;
					newUser = null;
				});
			} else {
                console.log('new passwords are differents');
                res.jsonp({msg: 'passwordDifferent', type: 'error'});
            }
		}
		err = null;
		currentUser = null;
	});
};

exports.list = function(req, res) {
	'use strict';
	var user = new User();
	user.getList(function (err, users) {
		if (err) {
			console.log('Not able to get user list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(users);
		}
		err = null;
		users = null;
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
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp({msg: 'userToggleActive', type: 'success'});
		}
		err = null;
	});
	id = null;
	user = null;
};

exports.active = function(req, res) {
	'use strict';
	console.log('Try to activate account ' + req.params.id);
	var user = new User();
	user.activate(req.params.id, req.params.hash, function (err, data) {
		res.redirect('/');
		err = null;
		data = null;
	});
	user = null;
};

exports.publicInfo = function (req, res) {
	'use strict';
	var userId = req.params.id,
		user = new User();
	user.getPublicInfo(userId, function(err, user) {
		if (err) {
			console.log('[ERROR] Not able to user public info: ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(user);
		}
		err = null;
		user = null;
	});
	userId = null;
	user = null;
};

exports.publicDriverInfo = function (req, res) {
    'use strict';
    var userId = req.params.id,
        user = new User();
    user.getPublicDriverInfo(userId, function(err, feedback) {
        if (err) {
            console.log('[ERROR] Not able to user public info: ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(feedback);
        }
		err = null;
		feedback = null;
    });
	userId = null;
	user = null;
};

exports.uploadPicture = function (req, res) {
    'use strict';
    console.dir(req.headers['content-type']);
    var userId= req.user.id,
        path = req.files.file.path,
        user = new User();
    // Remove root path from path
    path = path.replace(settings.path + '/public', '');
    user.addPicture(userId, path, function (err) {
        if (err) {
            console.log('[ERROR] Not able to save profil picture : ' + err);
            return res.jsonp({msg: err, type: 'error'});
        } else {
            return res.jsonp({msg: 'userPictureSaved', type: 'success'});
        }
    });
};

exports.deletePicture = function (req, res) {
    'use strict';
    var userId = req.user.id,
        user = new User();
    user.deletePicture(userId, function (err) {
        if (err) {
            console.log('[ERROR] Not able to delete profil picture : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp({msg:'userPictureRemoved', type: 'success'});
        }
		err = null;
    });
	userId = null;
	user = null;
};
