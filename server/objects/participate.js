/**
 * Created by jeremy on 25/01/15.
 */

var models = require('../models');
var Run = require('./run');
var User = require('./user');

function participate() {
    'use strict';
    this.user = null;
    this.run = null;
    this.createdAt = null;
    this.updatedAt = null;
}

participate.prototype.get = function () {
    return this;
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

module.exports = participate;