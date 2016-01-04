/* user object */

var models = require('../models');
var _ = require('lodash');
var Join = require('./join');
var Inbox = require('./inbox');
var Partner = require('./partner');
var q = require('q');
var redis = require('redis');

if (process.env.REDIS_URL) {
    var Rclient = redis.createClient(process.env.REDIS_URL);
} else {
    var Rclient = redis.createClient();
}

function journey() {
    'use strict';
	this.id = null;
	this.address_start = null;
	this.distance = null;
	this.duration = null;
	this.journey_type = null;
    this.date_start_outward= null;
    this.time_start_outward = null;
	this.nb_space_outward = null;
    this.date_start_return = null;
    this.time_start_return = null;
	this.nb_space_return = null;
	this.car_type = null;
	this.amount = null;
	this.Run = null;
}

journey.prototype.get = function () {
    'use strict';
	return this;
};

journey.prototype.setJourney = function (journey) {
    'use strict';
	if (journey.id) {
		this.id = journey.id; }
	if (journey.address_start) {
		this.address_start = journey.address_start; }
	if (journey.distance) {
		this.distance = journey.distance; }
	if (journey.duration) {
		this.duration = journey.duration; }
	if (journey.journey_type) {
		this.journey_type = journey.journey_type; }
	if (journey.date_start_outward) {
		this.date_start_outward = journey.date_start_outward; }
	if (journey.time_start_outward) {
		this.time_start_outward = journey.time_start_outward; }
	if (journey.nb_space_outward) {
		this.nb_space_outward = journey.nb_space_outward; }
	if (journey.date_start_return) {
		this.date_start_return = journey.date_start_return; }
	if (journey.time_start_return) {
		this.time_start_return = journey.time_start_return; }
	if (journey.nb_space_return) {
		this.nb_space_return = journey.nb_space_return; }
	if (journey.car_type) {
		this.car_type = journey.car_type; }
	if (journey.amount) {
		this.amount = journey.amount; }
    else {
        this.amount = 0; }
	if (journey.Run) {
		this.Run = journey.Run; }
};

journey.prototype.draft = function (journey, done) {
    'use strict';
    var journeyString = JSON.stringify(journey),
        journeyKey = 'JNY' + Math.floor(Math.random() * 100000);
    Rclient.set(journeyKey, journeyString, redis.print);
    done(null, journeyKey);
};

journey.prototype.saveDraft = function (journeyKey, userId, done) {
    'use strict';
    var self = this;
    Rclient.get(journeyKey, function (err, reply) {
        var draftJourney = JSON.parse(reply);
        self.save(draftJourney, userId, function (err, journey) {
            if (err) {
                done(err, null);
            } else {
                done(null, journey);
            }
        });
    });
};

journey.prototype.save = function (journey, userId, done) {
    'use strict';
    var that = this,
        partner = new Partner();
    models.User.findOne({where: {id: userId}})
        .then(function (user) {
            that.setJourney(journey);
            models.Run.findOne({where: {id: journey.Run.id}})
                .then(function (run) {
                    partner.getByToken(journey.token)
                        .then(function (selectedPartner) {
                            models.Journey.findOrCreate({where: {id: journey.id}, defaults: that})
                                .spread(function (selectedJourney, created) {
                                    if (created) {
                                        var newJourney = _.assign(selectedJourney, that);
                                        newJourney.setRun(run)
                                            .then(function () {
                                                newJourney.setUser(user)
                                                    .then(function(newJourney) {
                                                        if (selectedPartner) {
                                                            newJourney.setPartner(selectedPartner)
                                                                .then(function (newJourney) {
                                                                    done(null, newJourney);
                                                                });
                                                        } else {
                                                            done(null, newJourney);
                                                        }
                                                    });
                                            });
                                    } else {
                                        var updateJourney = _.assign(selectedJourney, that);
                                        updateJourney.save()
                                            .then(function (updatedJourney) {
                                                updatedJourney.setRun(run)
                                                    .then(function () {
                                                        updatedJourney.setUser(user)
                                                            .then(function(updatedJourney) {
                                                                if (selectedPartner) {
                                                                    updatedJourney.setPartner(selectedPartner)
                                                                        .then(function (updatedJourney) {
                                                                            done(null, updatedJourney);
                                                                        });
                                                                } else {
                                                                    done(null, updatedJourney);
                                                                }
                                                            });
                                                    });
                                            });
                                    }
                                })
                                .catch(function (err) {
                                    done(err, null);
                                });
                        })
                        .catch(function (err) {
                            done(err, null);
                        });
                });
        });
};

journey.prototype.filterPastJourney = function (journeys) {
    'use strict';
    var filterJourney = [],
        today = new Date();
    today.setHours(0,0,0,0);
    journeys.forEach(function (journey) {
        if (today <= journey.date_start_outward || today <= journey.date_start_return) {
            filterJourney.push(journey);
        }
    });
    return filterJourney;
};

journey.prototype.getList = function (old_journey, done) {
    'use strict';
    var that = this;
    models.Journey.findAll({include: [models.Run, models.User]})
		.then(function (journeys) {
            var filterJourney = [];
            if (old_journey === 0) {
                filterJourney = that.filterPastJourney(journeys);
            } else {
                filterJourney = journeys;
            }
			done(null, filterJourney);
		})
		.catch(function (err) {
			done(err, null);
		});
};

// Require to have Joins and Invoice included to be used
journey.prototype.filterFullJourney = function (journeys, limit) {
    'use strict';
    var openJourney = [],
        iterator = 0;
    journeys = this.filterPastJourney(journeys);
    journeys.forEach(function (journey) {
        var place = 0,
            book_place = 0;
        if (journey.nb_space_outward) {
            place += journey.nb_space_outward;
        }
        if (journey.nb_space_return) {
            place += journey.nb_space_return;
        }
        journey.Joins.forEach(function (join) {
            if (join.nb_place_outward && join.Invoice.status === 'completed') {
                book_place += join.nb_place_outward;
            }
            if (join.nb_place_return && join.Invoice.status === 'completed') {
                book_place += join.nb_place_return;
            }
        });
        if (place > book_place) {
            if (limit && limit > iterator) {
                iterator++;
                openJourney.push(journey);
            } else if (!limit) {
                openJourney.push(journey);
            }
        }
    });
    return openJourney;
};

journey.prototype.getOpenList = function (done) {
    'use strict';
    var that = this;
    models.Journey.findAll({where: {is_canceled: false}, include: [
                {
                    model: models.Join,
                    as: 'Joins',
                    include: [ models.Invoice ]
                },
                { model: models.Run }
            ]})
        .then(function (journeys) {
            var openJourney = that.filterFullJourney(journeys, 0);
            done(null, openJourney);
        })
        .catch(function (err) {
            done(err, null);
        });
};

journey.prototype.getListForRun = function (id, done) {
    'use strict';
    var that = this;
    models.Journey.findAll({where: {RunId: id, is_canceled: false}, include: [
        {
            model: models.Join,
            as: 'Joins',
            include: [ models.Invoice ]
        },
        { model: models.Run }
    ]})
        .then(function (journeys) {
            var openJourney = that.filterFullJourney(journeys, 0);
            done(null, openJourney);
        })
        .catch(function (err) {
            done(err, null);
        });
};

journey.prototype.getNextList = function (nb, done) {
    'use strict';
    var that = this;
    models.Journey.findAll({where: {is_canceled: false}, include: [
        {
            model: models.Join,
            as: 'Joins',
            include: [ models.Invoice ]
        },
        { model: models.Run }
    ], order: 'Journey.updatedAt DESC'})
        .then(function (journeys) {
            var openJourney = that.filterFullJourney(journeys, nb);
            done(null, openJourney);
        })
        .catch(function (err) {
            done(err, null);
        });
};

journey.prototype.getById = function (id, done) {
    'use strict';
	var that = this;
	models.Journey.find({where: {id: id}, include: [models.Run, models.User]})
		.then(function (journey) {
			done(null, journey);
		})
		.catch(function (err) {
			done(err, null);
		});
};

journey.prototype.getByUser = function (id, done) {
	'use strict';
	models.Journey.findAll({where: {userId: id, is_canceled: false},
                            include: [models.Run, models.User],
                            order: 'date_start_outward ASC'
                            })
		.then(function (journeys) {
			done(null, journeys);
		})
		.catch(function (err) {
			done(err, null);
		});
};

journey.prototype.getBookSpace = function (id, done) {
    'use strict';
    var values = {
        outward: 0,
        return: 0
    };
    models.Journey.find({where: {id: id, is_canceled: false},
                            include: [{
                                model: models.Join,
                                as: 'Joins',
                                include: [{
                                    model: models.Invoice,
                                    where: {status: 'completed'}
                                }]
                            }],
                            order: 'date_start_outward ASC'})
        .then(function (journey) {
            if (!journey) {
                done(null, values);
            } else {
                journey.Joins.forEach(function (join) {
                    values.outward += join.nb_place_outward;
                    values.return += join.nb_place_return;
                });
                done(null, values);
            }
        })
        .catch(function (err) {
            done(err, null);
        });
};

journey.prototype.togglePayed = function (id, done) {
    'use strict';
    models.Journey.find({where: {id: id, is_canceled: false}})
        .then(function (journey) {
            if (journey.is_payed === true) {
                journey.is_payed = false;
            } else {
                journey.is_payed = true;
            }
            journey.save()
                .then(function (newJourney) {
                    done(null, newJourney);
                });
        })
        .catch(function (err) {
            done(err, null);
        });
};

journey.prototype.cancelJoinsOfJourney = function (id, runame) {
    'use strict';
    var deferred = q.defer(),
        join = new Join(),
        inbox = new Inbox(),
        template = 'UserJourneyCancel',
        values = {runName: runame};
    // cancel all join link to the Journey and send mail to user
    join.getByJourney(id, function (err, journeyJoins) {
        var promises = [];
        if (err) {
            deferred.reject(new Error(err));
        } else {
            journeyJoins.forEach(function (journeyJoin) {
                promises.push(join.cancelById(journeyJoin.id));
                promises.push(inbox.add(template, values, journeyJoin.UserId));
            });
            q.all(promises).then(function () {
                deferred.resolve(journeyJoins);
            });
        }
    });
    return deferred.promise;
};

journey.prototype.cancel = function (id, done) {
    'use strict';
    var that = this;
    models.Journey.find({where: {id: id}, include: [models.Run]})
        .then(function (journey) {
            journey.is_canceled = true;
            journey.save()
                .then(function (newJourney) {
                    that.cancelJoinsOfJourney(newJourney.id, newJourney.Run.name)
                        .then(function (joins) {
                            done(null, newJourney);
                        })
                        .catch(function (err) {
                            done(err, null);
                        });
                });
        })
        .catch(function (err) {
            done(err, null);
        });
};

journey.prototype.notifyJoin = function (invoice, done) {
    'use strict';
    var inbox = new Inbox(),
        templateUser = 'UserJoinValidated',
        templateDriver = 'DriverJoinValidated',
        values = {
            runName: invoice.Journey.Run.name,
            journeyId: invoice.Journey.id };
    q.all([
        inbox.add(templateUser, values, invoice.UserId),
        inbox.add(templateDriver, values, invoice.Journey.UserId)])
        .then(function (res) {
            done(null, 'done');
        })
        .catch(function (err) {
            done(new Error('Journey notification : ' + err), null);
        });
};

module.exports = journey;
