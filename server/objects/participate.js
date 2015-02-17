/**
 * Created by jeremy on 25/01/15.
 */

var models = require('../models');
var Run = require('./run');
var User = require('./user');

function participate() {
    'use strict';
    this.userId = null;
    this.runId = null;
    this.createdAt = null;
    this.updatedAt = null;
}

participate.prototype.get = function () {
    return this;
};

participate.prototype.set = function (participe) {
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
    var that = this;
    console.log('add a date to agenda for user : ' + user.id);
    models.Run.find({where: {id: runId}})
        .then(function (run) {
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
                });
        });
};

participate.prototype.userList = function (userId, done) {
    console.log('get list of run fo user : ' + userId);
    models.Participate.findAll({where: {userId: userId}, include: [models.Run]})
        .then(function (participateUserList) {
            done(null, participateUserList);
        })
        .catch(function (err) {
            done(err, null);
        });
};

participate.prototype.runList = function (runId, done) {
    console.log('get list of user for run : ' + runId);
    models.Participate.findAll({where: {runId: runId}})
        .then(function (participateRunList) {
            done(null, participateRunList);
        })
        .catch(function (err) {
            done(err, null);
        });
};

module.exports = participate;