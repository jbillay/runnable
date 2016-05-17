/**
 * Created by jeremy on 25/01/15.
 */

var models = require('../models');
var Inbox = require('./inbox');
var q = require('q');
var async = require('async');

function participate() {
    'use strict';
    this.userId = null;
    this.runId = null;
    this.createdAt = null;
    this.updatedAt = null;
}

participate.prototype.get = function () {
    'use strict';
    return this;
};

participate.prototype.set = function (participe) {
    'use strict';
    if (participe.userId) {
        this.userId = participe.userId;
    }
    if (participe.runId) {
        this.runId = participe.runId;
    }
    if (participe.createdAt) {
        this.createdAt = participe.createdAt;
    }
    if (participe.updatedAt) {
        this.updatedAt = participe.updatedAt;
    }
};

participate.prototype.add = function (runId, user, done) {
    'use strict';
    var that = this;
    console.log('add a date to agenda for user : ' + user.id);
    models.Run.find({where: {id: runId}})
        .then(function (run) {
			if (!run) {
                done(new Error('No Run found'), null);
            }
            models.User.find({where: {id: user.id}})
                .then(function(user) {
                    models.Participate.create(that)
                        .then(function (newParticipate) {
                            newParticipate.setUser(user)
                                .then(function(newParticipate) {
                                    newParticipate.setRun(run)
                                        .then(function (newParticipate) {
                                            done(null, newParticipate);
                                        })
                                        .catch(function(err) {
                                            done(err, null);
                                        });
                                });
                        });
                })
                .catch(function (err) {
                    done(err, null);
                });
        })
        .catch(function (err) {
            done(err, null);
        });
};

participate.prototype.userList = function (userId, done) {
    'use strict';
    console.log('get list of run for user : ' + userId);
    models.Participate.findAll({where: {userId: userId}, include: [models.Run]})
        .then(function (participateUserList) {
            done(null, participateUserList);
        })
        .catch(function (err) {
            done(err, null);
        });
};

participate.prototype.userRunList = function (runId, done) {
    'use strict';
    console.log('get list of user for run : ' + runId);
    models.Participate.findAll({where: {runId: runId}})
        .then(function (participateRunList) {
            done(null, participateRunList);
        })
        .catch(function (err) {
            done(err, null);
        });
};

participate.prototype.notify = function (run, journey, done) {
    'use strict';
    var inbox = new Inbox();

    models.Run.findOne({where: {id: run.id}})
        .then(function (selectedRun) {
            models.Participate.findAll({where: {runId: selectedRun.id}, include: [models.User]})
                .then(function (participations) {
                    var queue = async.queue(function (options, callback) {
                        inbox.add(options.template, options.values, options.userId)
                            .then(function (msg) {
                                callback(null, msg);
                            })
                            .catch(function (err) {
                                callback(err, null);
                            });
                    });
                    var template = 'NotifyNewJourney',
                        values = {
                            runName: selectedRun.name,
                            journeyId: journey.id,
                            journeyStart: journey.address_start};

                    participations.forEach(function (participation) {
                        queue.push({template: template, values: values, userId: participation.User.id}, function (err, msg) {
                            if (err) {
                                console.log(new Error('Message not sent : ' + err));
                            } else {
                                console.log('Msg sent to notify new journey to participant');
                            }
                        });
                    });
                    queue.drain = function () {
                        done(null, participations);
                    };
                })
                .catch(function (err) {
                    done(err, null);
                });
        })
        .catch(function (err) {
            done(err, null);
        });
};

module.exports = participate;