/**
 * Created by jeremy on 25/01/15.
 */

'use strict';

var models = require('../models');
var Mail = require('../objects/mail');

function inbox() {
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
    if (typeof inbox.is_read !== 'undefined') {
        this.is_read = inbox.is_read;
    }
    if (inbox.createdAt) {
        this.createdAt = inbox.createdAt;
    }
    if (inbox.updatedAt) {
        this.updatedAt = inbox.updatedAt;
    }
};

inbox.prototype.add = function (template, values, userId, done) {
    var that = this;

    console.log('add a message for user : ' + userId);
	new Mail().then(function (mail) {
		mail.generateContent(template, values)
			.then(function (mail) {
                models.User.find({where: {id: userId}})
                    .then(function(user) {
						var message = mail.getContentHtml(),
							title = mail.getSubject();
						mail.setTo(user.email);
						mail.send();
                        that.title = title;
                        that.message = message;
                        that.is_read = false;
						models.Inbox.create(that)
							.then(function (newMessage) {
								newMessage.setUser(user)
									.then(function (newMessage) {
										done(null, newMessage);
									})
									.catch(function (err) {
										done(err, null);
									});
							});
					});
            })
			.catch(function (err) {
				done(new Error('Unable to send mail : ' + err), null);
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