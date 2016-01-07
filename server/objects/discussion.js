/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

var models = require('../models');
var Inbox = require('./inbox');
var Mail = require('./mail');
var q = require('q');

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
                                    template = 'JourneyPublicMessage';
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
                        var values = {
                                    runName: journey.Run.name,
                                    journeyId: journey.id,
                                    username: user.firstname + ' ' + user.lastname,
                                    text: message },
                            template = 'JourneyPrivateMessage',
                            privatePromises = [];
                        if (discussionUsers) {
                            discussionUsers.forEach(function (discussionUser) {
                                if (discussionUser.id !== user.id) {
                                    privatePromises.push(inbox.add(template, values, discussionUser.id));
                                }
                            });
                        }
                        q.all(privatePromises)
                            .then(function(res) {
                                done(null, 'Notifications sent to users');
                            })
                            .catch(function (err) {
                                done(new Error('Discussion : ' + err), null);
                            });
                    })
                    .catch(function (err) {
                        done(new Error(err), null);
                    });
            } else {
                that.getPublicUsers(journeyId)
                    .then (function(list) {
                        var values = {
                                runName: journey.Run.name,
                                journeyId: journey.id,
                                username: 'Un utilisateur',
                                text: message
                            },
                            template = 'JourneyPublicMessage',
                            publicPromises = [];
                        if (user) {
                            values.username = user.firstname + ' ' + user.lastname;
                        }
                        if (list.users) {
                            list.users.forEach(function (discussionUser) {
                                if (discussionUser.id !== user.id) {
                                    publicPromises.push(inbox.add(template, values, discussionUser.id));
                                }
                            });
                        }
                        if (list.emails) {
                            list.emails.forEach(function (discussionEmail) {
                                publicPromises.push(that.mail.sendEmail(template, values, discussionEmail));
                            });
                        }
                        q.all(publicPromises)
                            .then(function(res) {
                                done(null, 'Notifications sent to users');
                            })
                            .catch(function (err) {
                                done(new Error('Discussion : ' + err), null);
                            });
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