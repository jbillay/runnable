/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

var models = require('../models');
var Inbox = require('./inbox');
var Mail = require('./mail');
var q = require('q');
var async = require('async');
var _ = require('lodash');

function discussion() {
    this.id = null;
    this.message = null;
    this.is_public = null;
    this.email = null;
    this.createdAt = null;
    this.updatedAt = null;
    this.mail = new Mail();
}

discussion.prototype.get = function () {
    return this;
};

discussion.prototype.set = function (discussion) {
    if (discussion.id) {
        this.id = discussion.id;
    }
    if (discussion.message) {
        this.message = discussion.message;
    }
    if (discussion.is_public !== undefined) {
        this.is_public = discussion.is_public;
    } else {
        this.is_public = true;
    }
    if (discussion.email) {
        this.email = discussion.email;
    }
    if (discussion.createdAt) {
        this.createdAt = discussion.createdAt;
    }
    if (discussion.updatedAt) {
        this.updatedAt = discussion.updatedAt;
    }
};

// For testing purpose (Mock mail functions)
discussion.prototype.setMail = function (mail) {
    this.mail = mail;
};

discussion.prototype.getUsers = function (journeyId) {
    var deferred = q.defer();
    models.Journey.find({where: {id: journeyId}})
        .then(function (journey) {
            if (journey) {
                journey.getJoins().then(function (joins) {
                    var userList = [];
                    userList.push(journey.UserId);
                    joins.forEach(function (join) {
                        userList.push(join.UserId);
                    });
                    userList = _.uniq(userList);
                    models.User.findAll({where: {id: userList}})
                        .then(function (users) {
                            deferred.resolve(users);
                        }).catch(function (err) {
                            deferred.reject(new Error(err));
                        });
                });
            } else {
                deferred.resolve(null);
            }
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

discussion.prototype.getPublicUsers = function (journeyId) {
    var deferred = q.defer();
    models.Discussion.findAll({where: {JourneyId: journeyId, is_public: true}, include: [models.Journey]})
        .then(function (discussions) {
            var list = {
                users: [],
                emails: []
            };
            if (discussions && discussions.length > 0) {
                list.users.push(discussions[0].Journey.UserId);
                discussions.forEach(function (discussion) {
                    if (discussion.UserId) {
                        list.users.push(discussion.UserId);
                    } else if (discussion.email) {
                        list.emails.push(discussion.email);
                    }
                });
                list.users = _.uniq(list.users);
                list.emails = _.uniq(list.emails);
                models.User.findAll({where: {id: list.users}})
                    .then(function (users) {
                        list.users = users;
                        deferred.resolve(list);
                    }).catch(function (err) {
                        deferred.reject(new Error(err));
                    });
            } else {
                deferred.resolve(null);
            }
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

discussion.prototype.getMessages = function (journeyId, isPublic, done) {
    models.Discussion.findAll({where: {JourneyId:   journeyId, is_public: isPublic},
                                        include:    [{model: models.User, required: false}],
                                        order:      'Discussion.createdAt DESC'})
        .then(function (messages) {
            done(null, messages);
        })
        .catch(function (err) {
            done(err, null);
        });
};

discussion.prototype.addMessage = function (message, journeyId, isPublic, user, email, done) {
	var that = this;

    that.message = message;
    that.email = email;
    that.is_public = isPublic;
	console.log('try to add message to journey : ' + journeyId);
	models.Journey.find({where: {id: journeyId}, include: [models.Run]})
        .then(function (journey) {
            if (!journey) {
                done(new Error('No Journey found'), null);
            } else {
                models.Discussion.create(that)
                    .then(function (newDiscussion) {
                        newDiscussion.setJourney(journey)
                            .then(function (newDiscussion) {
                                var inbox = new Inbox(),
                                    template;
                                if (isPublic) {
                                    template = 'JourneyPublicMessage';
                                } else {
                                    template = 'JourneyPrivateMessage';
                                }
                                if (user) {
                                    models.User.find({where: {id: user.id}})
                                        .then(function(user) {
                                            newDiscussion.setUser(user)
                                                .then(function (newDiscussion) {
                                                    var values = {
                                                            runName: journey.Run.name,
                                                            journeyId: journey.id,
                                                            text: message,
                                                            username: user.firstname + ' ' + user.lastname
                                                        };
                                                    inbox.add(template, values, journey.UserId)
                                                        .then(function (message) {
                                                            done(null, newDiscussion);
                                                        })
                                                        .catch(function (err) {
                                                            done(new Error(err), null);
                                                        });
                                                })
                                                .catch(function (err) {
                                                    done(err, null);
                                                });
                                    });
                                } else {
                                    var values = {
                                            runName: journey.Run.name,
                                            journeyId: journey.id,
                                            text: message,
                                            username: 'Un utilisateur'
                                        };
                                    inbox.add(template, values, journey.UserId)
                                        .then(function (message) {
                                            done(null, newDiscussion);
                                        })
                                        .catch(function (err) {
                                            done(new Error(err), null);
                                        });
                                }
                            });
                    });
            }
		})
        .catch(function (err) {
            done(new Error(err), null);
        });
};

discussion.prototype.notificationMessage = function (journeyId, message, is_public, user, done) {
    var that = this;
    var inbox = new Inbox();
    console.log('Notify users of a new message on journey ' + journeyId);
    models.Journey.find({where: {id: journeyId}, include: [models.Run]})
        .then(function (journey) {
            if (is_public === false) {
                that.getUsers(journeyId)
                    .then(function (discussionUsers) {
                        var queue = async.queue(function (options, callback) {
                            inbox.add(options.template, options.values, options.userId)
                                .then(function (msg) {
                                    callback(null, msg);
                                })
                                .catch(function (err) {
                                    callback(err, null);
                                });
                        });
                        var template = 'JourneyPrivateMessage',
                            values = {
                                runName: journey.Run.name,
                                journeyId: journey.id,
                                username: user.firstname + ' ' + user.lastname,
                                text: message };
                        discussionUsers.forEach(function (discussionUser) {
                            if (discussionUser.id !== user.id) {
                                queue.push({template: template, values: values, userId: discussionUser.id}, function (err, msg) {
                                    if (err) {
                                        console.log(new Error('Message not sent : ' + err));
                                    } else {
                                        console.log('Msg sent to journey user');
                                    }
                                });
                            }
                        });
                        queue.drain = function () {
                            done(null, 'Private msg notifications has been sent to users');
                        };
                    })
                    .catch(function (err) {
                        done(new Error(err), null);
                    });
            } else {
                that.getPublicUsers(journeyId)
                    .then (function(list) {
                        var queue = async.queue(function (options, callback) {
                            if (options.userId && options.email === null) {
                                inbox.add(options.template, options.values, options.userId)
                                    .then(function (msg) {
                                        callback(null, msg);
                                    })
                                    .catch(function (err) {
                                        callback(err, null);
                                    });
                            } else if (options.email && options.userId === null) {
                                that.mail.sendEmail(options.template, options.values, options.email)
                                    .then(function (msg) {
                                        callback(null, msg);
                                    })
                                    .catch(function (err) {
                                        callback(err, null);
                                    });
                            }
                        });
                        var template = 'JourneyPublicMessage',
                            values = {
                                runName: journey.Run.name,
                                journeyId: journey.id,
                                username: 'Un utilisateur',
                                text: message };
                        if (user) {
                            values.username = user.firstname + ' ' + user.lastname;
                        }
                        list.users.forEach(function (discussionUser) {
                            if (discussionUser.id !== user.id) {
                                queue.push({template: template, values: values, userId: discussionUser.id, email: null},
                                    function (err, msg) {
                                        if (err) {
                                            console.log(new Error('Message not sent : ' + err));
                                        } else {
                                            console.log('Public msg sent to journey user ' + discussionUser.id);
                                        }
                                    });
                            }
                        });
                        list.emails.forEach(function (discussionEmail) {
                            queue.push({template: template, values: values, userId: null, email: discussionEmail},
                                function (err, msg) {
                                    if (err) {
                                        console.log(new Error('Message not sent : ' + err));
                                    } else {
                                        console.log('Public msg sent to email ' + discussionEmail);
                                    }
                                });
                        });
                        queue.drain = function () {
                            done(null, 'Public msg notifications has been sent to users');
                        };
                    })
                .catch(function (err) {
                    done(new Error(err), null);
                });
            }
        })
        .catch(function (err) {
            done(new Error(err), null);
        });
};

module.exports = discussion;