/**
 * Created by jeremy on 25/01/15.
 */

'use strict';

var models = require('../models');
var Mail = require('./mail');
var q = require('q');

function inbox() {
    this.userId = null;
    this.title = null;
	this.message = null;
	this.is_read = null;
    this.createdAt = null;
    this.updatedAt = null;
    this.mail = new Mail();
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

// For testing purpose (Mock mail functions)
inbox.prototype.setMail = function (mail) {
    this.mail = mail;
};

inbox.prototype.add = function (template, values, userId) {
    var deferred = q.defer(),
        that = this;

    console.log('add a message for user : ' + userId);
    that.mail.init()
        .then(function () {
            that.mail.generateContent(template, values)
                .then(function () {
                    models.User.find({where: {id: userId}})
                        .then(function(user) {
                            var message = that.mail.getContentHtml(),
                                title = that.mail.getSubject(),
                                currentMessage = {
                                    userId: user.id,
                                    title: title,
                                    message: message,
                                    is_read: false,
                                    createdAt: null,
                                    updatedAt: null
                                };
                            that.mail.setTo(user.email);
                            models.Inbox.create(currentMessage)
                                .then(function (newMessage) {
                                    newMessage.setUser(user)
                                        .then(function (newMessage) {
                                            that.mail.send()
                                                .then(function (res) {
                                                    deferred.resolve(newMessage);
                                                })
                                                .catch(function (err) {
                                                    deferred.reject(new Error('Email has not been sent to user : ' + err));
                                                });
                                        })
                                        .catch(function (err) {
                                            deferred.reject(new Error('Inbox : not able to set User : ' + err));
                                        });
                                })
                                .catch(function (err) {
                                    deferred.reject(new Error('Inbox : not able to create inbox : ' + err));
                                });
                        })
                        .catch(function (err) {
                            deferred.reject(new Error('Unable to find user : ' + err));
                        });
                })
                .catch(function (err) {
                    deferred.reject(new Error('Unable to generate mail : ' + err));
                });
        })
        .catch(function (err) {
            deferred.reject(new Error('Unable to init mail : ' + err));
        });
    return deferred.promise;
};

inbox.prototype.getList = function (user, done) {
	console.log('get inbox messages for user : ' + user.id);
	models.Inbox.findAll({where: {userId: user.id}, order: 'createdAt DESC'})
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

inbox.prototype.delete = function (id, done) {
    console.log('Delete message : ' + id);
    models.Inbox.find({where: {id: id}})
        .then(function (message) {
            message.destroy()
                .then(function () {
                    done(null, 'messageDeleted');
                })
                .catch(function (err) {
                    done(err, null);
                });
        })
        .catch(function (err) {
            done(err, null);
        });
};

module.exports = inbox;