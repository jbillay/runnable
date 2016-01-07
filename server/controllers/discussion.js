/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

var Discussion = require('../objects/discussion');

exports.getUsers = function (req, res) {
    var discussion = new Discussion(),
        journeyId = req.params.id;
    console.log('Get discussion users for journey : ' + journeyId);
    discussion.getUsers(journeyId)
        .then(function(users) {
            return res.jsonp(users);
        })
        .catch(function(err) {
            console.log(new Error('Not able to get discussion users for journey : ' + err));
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.getPublicMessages = function (req, res) {
    var discussion = new Discussion(),
        is_public = true,
        journeyId = req.params.id;
    console.log('Get discussion public messages for journey : ' + journeyId);
    discussion.getMessages(journeyId, is_public, function(err, messages) {
        if (err) {
            console.log('Not able to get discussion messsages for journey : ' + err);
            return res.jsonp({msg: err, type: 'error'});
        } else {
            return res.jsonp(messages);
        }
    });
};

exports.getPrivateMessages = function (req, res) {
    var discussion = new Discussion(),
        is_public = false,
        journeyId = req.params.id;
    console.log('Get discussion private messages for journey : ' + journeyId);
    discussion.getMessages(journeyId, is_public, function(err, messages) {
        if (err) {
            console.log('Not able to get discussion messsages for journey : ' + err);
            return res.jsonp({msg: err, type: 'error'});
        } else {
            return res.jsonp(messages);
        }
    });
};

exports.addPrivateMessage = function (req, res, next) {
	var discussion = new Discussion(),
        journeyId = req.body.journeyId,
		message = req.body.message,
        is_public = false,
		user = req.user;
	discussion.addMessage(message, journeyId, is_public, user, null, function(err, messages) {
        if (err) {
            console.log('Not able to add discussion messsage for journey : ' + err);
            return res.jsonp({msg: err, type: 'error'});
        } else {
            req.notifMessage = {
                journeyId: journeyId,
                message: message,
                is_public: is_public,
                user: user
            };
            next();
            //return res.jsonp({msg: 'ok', type: 'success'});
            return null;
        }
    });
};

exports.addPublicMessage = function (req, res, next) {
	var discussion = new Discussion(),
        journeyId = req.body.journeyId,
		message = req.body.message,
		email = req.body.email,
        is_public = true,
		user = req.user;
	discussion.addMessage(message, journeyId, is_public, user, email, function(err, messages) {
        if (err) {
            console.log('Not able to add discussion messsage for journey : ' + err);
            return res.jsonp({msg: err, type: 'error'});
        } else {
            req.notifMessage = {
                journeyId: journeyId,
                message: message,
                is_public: is_public,
                user: user
            };
            next();
            return null;
        }
    });
};

exports.notificationMessage = function (req, res) {
    var discussion = new Discussion(),
        dataNotificationMessage = req.notifMessage;
    discussion.notificationMessage(dataNotificationMessage.journeyId, dataNotificationMessage.message,
        dataNotificationMessage.is_public, dataNotificationMessage.user, function (err, message) {
            if (err) {
                return res.jsonp({msg: err, type:'error'});
            } else {
                return res.jsonp({msg: message, type:'success'});
            }
    });
};