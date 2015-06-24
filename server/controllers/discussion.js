/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

var Discussion = require('../objects/discussion');

exports.getUsers = function (req, res) {
    var discussion = new Discussion(),
        journeyId = req.params.id;
    console.log('Get discussion users for journey : ' + journeyId);
    discussion.getUsers(journeyId, function(err, users) {
        if (err) {
            console.log('Not able to get discussion users for journey : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(users);
        }
        err = null;
        users = null;
    });
    discussion = null;
    journeyId = null;
};

exports.getPublicMessages = function (req, res) {
    var discussion = new Discussion(),
        is_public = true,
        journeyId = req.params.id;
    console.log('Get discussion public messages for journey : ' + journeyId);
    discussion.getMessages(journeyId, is_public, function(err, messages) {
        if (err) {
            console.log('Not able to get discussion messsages for journey : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(messages);
        }
        err = null;
        messages = null;
    });
    discussion = null;
    journeyId = null;
};

exports.getPrivateMessages = function (req, res) {
    var discussion = new Discussion(),
        is_public = false,
        journeyId = req.params.id;
    console.log('Get discussion private messages for journey : ' + journeyId);
    discussion.getMessages(journeyId, is_public, function(err, messages) {
        if (err) {
            console.log('Not able to get discussion messsages for journey : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(messages);
        }
        err = null;
        messages = null;
    });
    discussion = null;
    journeyId = null;
};

exports.addPrivateMessage = function (req, res) {
	var discussion = new Discussion(),
        journeyId = req.body.journeyId,
		message = req.body.message,
        is_public = false,
		user = req.user;
	discussion.addMessage(message, journeyId, is_public, user, function(err, messages) {
        if (err) {
            console.log('Not able to add discussion messsage for journey : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp({msg: 'ok', type: 'success'});
        }
        err = null;
        messages = null;
    });
    discussion = null;
    journeyId = null;
};

exports.addPublicMessage = function (req, res) {
	var discussion = new Discussion(),
        journeyId = req.body.journeyId,
		message = req.body.message,
        is_public = true,
		user = req.user;
	discussion.addMessage(message, journeyId, is_public, user, function(err, messages) {
        if (err) {
            console.log('Not able to add discussion messsage for journey : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp({msg: 'ok', type: 'success'});
        }
        err = null;
        messages = null;
    });
    discussion = null;
    journeyId = null;
};