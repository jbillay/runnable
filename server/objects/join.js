/* user object */

var models = require('../models');
var Invoice = require('./invoice');
var Inbox = require('./inbox');
var q = require('q');

function join() {
    'use strict';
	this.id = null;
	this.nb_place_outward = null;
	this.nb_place_return = null;
	this.user = null;
	this.journey_id = null;
}

join.prototype.get = function () {
    'use strict';
	return this;
};

join.prototype.set = function (join) {
    'use strict';
	if (join.id) {
		this.id = join.id; }
	if (join.nb_place_outward) {
		this.nb_place_outward = join.nb_place_outward; }
	if (join.nb_place_return) {
		this.nb_place_return = join.nb_place_return; }
	if (join.journey_id) {
		this.journey_id = join.journey_id; }
};

join.prototype.setUser = function (user) {
	'use strict';
	this.user = user;
};

join.prototype.setJourney = function (journey) {
	'use strict';
	this.journey = journey;
};

join.prototype.save = function (join, user, done) {
    'use strict';
	var that = this;

	this.set(join);
	console.log('try to join for the journey : ' + that.journey_id);
	models.User.find({where: {id: user.id}})
		.then(function (user) {
			that.setUser(user);
			models.Journey.find({where: {id: that.journey_id}})
				.then(function (journey) {
					that.setJourney(journey);
					models.Join.create(that)
						.then(function(newJoin) {
							newJoin.setJourney(journey)
								.then(function () {
									newJoin.setUser(user)
										.then(function(newJoin) {
											done(null, newJoin);
										})
										.catch(function(err) {
											done(err, null);
										});
								});
						});
				});
		});
};

join.prototype.getById = function (id, done) {
    'use strict';
	models.Join.find({ where: {id: id}})
		.then(function (join) {
			done(null, join);
		})
		.catch(function (err) {
			done(err, null);
		});
};

join.prototype.getByUser = function (id, done) {
    'use strict';
	models.Join.findAll({where: {userId: id}, include: [models.ValidationJourney,
                    {
                        model: models.Invoice,
                        where: {status: 'completed'}
                    },
                    {
                        model: models.Journey,
                        as: 'Journey',
                        include: [ models.Run, models.User ]
                    }]})
		.then(function (joins) {
			done(null, joins);
		})
		.catch(function (err) {
			done(err, null);
		});
};

join.prototype.getByJourney = function (journeyId, done) {
    'use strict';
	models.Join.findAll({ where: {JourneyId: journeyId}, include: [models.ValidationJourney,
                    {
                        model: models.Invoice,
                        where: {status: 'completed'}
                    }]})
		.then(function (joins) {
				done(null, joins);
		})
		.catch(function (err) {
			done(err, null);
		});
};

join.prototype.getList = function (done) {
	'use strict';
	models.Join.findAll({include: [{
							model: models.Journey,
							as: 'Journey',
							include: [ models.Run ]
						}, models.User, models.Invoice, models.ValidationJourney]})
		.then(function (joins) {
			done(null, joins);
		})
		.catch(function (err) {
			done(err, null);
		});
};

join.prototype.toRefund = function () {
    'use strict';
    var deferred = q.defer();
    models.Join.findAll({include: [ {
            model: models.Journey,
            as: 'Journey',
            include: [ models.Run ]
        }, {model: models.User},
        {
            model: models.Invoice,
            where: {status: 'cancelled'}
        }]})
        .then(function (joins) {
            deferred.resolve(joins);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

join.prototype.refund = function (id) {
    'use strict';
    var deferred = q.defer();
    models.Join.find({where: {id: id}, include: {model: models.Invoice}})
        .then(function (join) {
            join.Invoice.status = 'refunded';
            join.Invoice.save()
                .then(function (updatedInvoice) {
                    deferred.resolve(updatedInvoice);
                })
                .catch(function (err) {
                    deferred.reject(err);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

join.prototype.cancelById = function (id, user, notif) {
	'use strict';
	var deferred = q.defer(),
        invoice = new Invoice();
	models.Join.find({ where: {id: id}, include: [{
                                            model: models.Journey,
                                            as: 'Journey',
                                            include: [ models.Run ]},
                                        models.User, models.Invoice]})
		.then(function (join) {
			if (!join) {
                deferred.reject(new Error('Join not found'));
			} else {
                invoice.updateStatus(join.Invoice.id, 'cancelled', function (err, invoice) {
					if (err) {
                        deferred.reject(new Error(err));
					} else {
                        if (notif) {
                            var inbox = new Inbox(),
                                templateUser = 'UserJoinJourneyCancel',
                                templateDriver = 'DriverJoinJourneyCancel',
                                values = { runName: join.Journey.Run.name };
                            inbox.add(templateDriver, values, join.Journey.UserId)
                                .then(function (msg) {
                                    inbox.add(templateUser, values, user.id)
                                        .then(function (msg) {
                                            deferred.resolve(invoice);
                                        })
                                        .catch(function (err) {
                                            deferred.reject(new Error(err));
                                        });
                                })
                                .catch(function (err) {
                                    deferred.reject(new Error(err));
                                });
                        } else {
                            deferred.resolve(invoice);
                        }
    				}
				});
			}
		})
		.catch(function (err) {
            deferred.reject(err);
		});
    return deferred.promise;
};

module.exports = join;
