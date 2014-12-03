/* user object */

var models = require('../models');
var Run = require('./run');
var async = require('async');

function journey() {
    'use strict';
	this.id = null;
	this.address_start = null;
	this.distance = null;
	this.duration = null;
    this.date_start= null;
    this.time_start = null;
	this.car_type = null;
	this.nb_space = null;
	this.amount = null;
	this.run = null;
}

journey.prototype.get = function () {
    'use strict';
	return this;
};

journey.prototype.setRun = function (run) {
	this.run = run;
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
	if (journey.date_start) {
		this.date_start = journey.date_start; }
	if (journey.time_start) {
		this.time_start = journey.time_start; }
	if (journey.car_type) {
		this.car_type = journey.car_type; }
	if (journey.nb_space) {
		this.nb_space = journey.nb_space; }
	if (journey.amount) {
		this.amount = journey.amount; }
};

journey.prototype.save = function (journey, user, done) {
    'use strict';
	var that = this;
	models.User.find({where: {id: user.id}})
		.then(function (user) {
			that.setJourney(journey);
			models.Run.find({where: {id: journey.run_id}})
				.then(function (run) {
					models.Journey.create(that)
						.then(function(newJourney) {
							newJourney.setRun(run)
								.then(function () {
									newJourney.setUser(user)
										.then(function(newJourney) {
											done(null, newJourney);
										})
										.catch(function(err) {
											done(err, null);
										});
								});
						});
				});
		});
};

journey.prototype.getList = function (done) {
    'use strict';
	var that = this;
	models.Journey.findAll({include: [models.Run]})
		.then(function (journeys) {
			done(null, journeys);
		})
		.catch(function (err) {
			done(err, null);
		});
};

journey.prototype.getListForRun = function (id, done) {
    'use strict';
	models.Run.find({where: {id: id}})
		.then(function (run) {
			run.getJourneys().then(function (journeys) {
				done(null, journeys);
			});
		})
		.catch(function (err) {
			done(err, null);
		});
};

journey.prototype.getNextList = function (nb, done) {
    'use strict';
	models.Journey.findAll({limit: nb, order: 'updatedAt ASC ', include: [models.Run]})
		.then(function (runs) {
			done(null, runs);
		})
		.catch(function (err) {
			done(err, null);
		});
};

journey.prototype.getById = function (id, done) {
    'use strict';
	var that = this;
	models.Journey.find({where: {id: id}})
		.then(function (journey) {
			that.setJourney(journey);
			journey.getRun().then(function (run) {
				that.setRun(run);
				done(null, that);
			});
		})
		.catch(function (err) {
			done(err, null);
		});
};

journey.prototype.getByUser = function (id, done) {
	'use strict';
	models.Journey.findAll({where: {userId: id}, include: [models.Run, models.Join]})
		.then(function (journeys) {
			done(null, journeys);
		})
		.catch(function (err) {
			done(err, null);
		});
};

module.exports = journey;
