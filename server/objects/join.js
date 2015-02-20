/* user object */

var models = require('../models');

function join() {
    'use strict';
	this.id = null;
	this.nb_place_outward = null;
	this.nb_place_return = null;
	this.journey = null;
    this.status = null;
	this.amount = null;
	this.invoice = null;
	this.transaction = null;
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
	if (join.status) {
		this.status = join.status; }
	if (join.amount) {
		this.amount = parseFloat(join.amount).toFixed(2); }
	if (join.transaction) {
		this.transaction = join.transaction; }
	if (join.invoice) {
		this.invoice = join.invoice; }
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
	models.Join.findAll({where: {userId: id, status: 'completed'}, include: [models.ValidationJourney, {
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
	models.Journey.find({ where: {id: journeyId}})
		.then(function (journey) {
			journey.getJoins().then(function (joins) {
				done(null, joins);
			});
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
						}, models.User]})
		.then(function (joins) {
			done(null, joins);
		})
		.catch(function (err) {
			done(err, null);
		});
};

join.prototype.updatePaymentStatus = function (invoiceRef, amount, status, transactionId, done) {
	'use strict';
    console.log('Update invoice ' + invoiceRef + ' to status ' + status);
	models.Join.find({ where: {invoice: invoiceRef}})
		.then(function (join) {
			if (join.amount === amount) {
				join.status = status;
				join.transaction = transactionId;
				join.save()
					.then(function (newJoin) {
						done(null, newJoin);
					})
					.catch(function (err) {
						done(new Error(err), null);
					});
			} else {
				done(new Error('Amount is different then initial'), null);
			}
		})
		.catch(function (err) {
			done(err, null);
		});
};

module.exports = join;
