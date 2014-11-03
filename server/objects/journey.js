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
		.success(function (user) {
			that.setJourney(journey);
			models.Run.find({where: {id: journey.run_id}})
				.success(function (run) {
					models.Journey.create(that)
						.success(function(newJourney) {
							newJourney.setRun(run)
								.success(function () {
									newJourney.setUser(user)
										.error(function(err) {
											done(err, null);
										})
										.success(function(newJourney) {
											done(null, newJourney);
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
		.error(function (err) {
			done(err, null);
		})
		.success(function (journeys) {
			done(null, journeys);
		});
};

journey.prototype.getListForRun = function (id, done) {
    'use strict';
	models.Run.find({where: {id: id}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (run) {
			run.getJourneys().success(function (journeys) {
				done(null, journeys);
			});
		});
};

journey.prototype.getById = function (id, done) {
    'use strict';
	var that = this;
	models.Journey.find({where: {id: id}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (journey) {
			that.setJourney(journey);
			journey.getRun().success(function (run) {
				console.log(run);
				that.setRun(run);
				done(null, that);
			});
		});
};

module.exports = journey;
