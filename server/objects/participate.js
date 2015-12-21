/**
 * Created by jeremy on 25/01/15.
 */

var models = require('../models');
var Mail = require('../objects/mail');

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
                });
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
    var template = 'NotifyNewJourney',
        values = {
            runName: run.name,
            journeyId: journey.id,
            journeyStart: journey.address_start};
    new Mail().then(function (mail) {
        mail.generateContent(template, values)
            .then(function (mail) {
                models.Participate.findAll({where: {runId: run.id}, include: [models.User]})
                    .then(function (participations) {
                        participations.forEach(function (participation) {
                            mail.setTo(participation.User.email);
                            mail.send();
                            console.log('Journey notification sent to ' + participation.User.email);
                        });
                        done(null, participations);
                    })
                    .catch(function (err) {
                        done(err, null);
                    });
            })
            .catch(function (err) {
                done(err, null);
            });
        });
};

module.exports = participate;