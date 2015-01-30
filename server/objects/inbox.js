/**
 * Created by jeremy on 25/01/15.
 */

var models = require('../models');
var User = require('./user');

function inbox() {
    'use strict';
    this.userId = null;
    this.title = null;
	this.message = null;
	this.is_read = null;
    this.createdAt = null;
    this.updatedAt = null;
}

inbox.prototype.get = function () {
    return this;
};

inbox.prototype.set = function (inbox) {
    if (inbox.userId) {
        this.userId = inbox.userId;
    }
    if (inbox.message) {
        this.message = inbox.message;
    }
    if (inbox.title) {
        this.title = inbox.title;
    }
    if (inbox.is_read) {
        this.is_read = inbox.is_read;
    }
    if (inbox.createdAt) {
        this.createdAt = inbox.createdAt;
    }
    if (inbox.updatedAt) {
        this.updatedAt = inbox.updatedAt;
    }
};

inbox.prototype.add = function (msg, title, userId, done) {
    this.title = title;
	this.message = msg;
	this.is_read = false;
    var that = this;
    console.log('add a message for user : ' + userId);
	models.User.find({where: {id: userId}})
		.then(function(user) {
			models.Inbox.create(that)
				.then(function (newMessage) {
					newMessage.setUser(user)
						.then(function(newMessage) {
							done(null, newMessage);
						})
						.catch(function(err) {
							done(err, null);
						});
				});
		});
};

inbox.prototype.getList = function (user, done) {
	console.log('get inbox messages for user : ' + user.id);
	models.Inbox.findAll({where: {userId: user.id}})
		.then(function (messages) {
			done(null, messages);
		})
		.catch(function (err) {
			done(err, null);
		});
};

inbox.prototype.setIsRead = function (id, state, done) {
	console.log('Make read the message : ' + id);
	models.Inbox.find({where: {id: id}})
		.then(function (message) {
			message.is_read = state;
			message.save()
				.then(function (message) {
					done(null, message);
				})
				.catch(function (err) {
					done(err, null);
				});
		})
		.catch(function (err) {
			done(err, null);
		});
};

inbox.prototype.countUnread = function (userId, done) {
	console.log('Count unread message for user : ' + userId);
	models.Inbox.count({where: {userId: userId, is_read: false}})
		.then(function(nb) {
			done(null, nb);
		})
		.catch(function (err) {
			done(err, null);
		});			
};

module.exports = inbox;