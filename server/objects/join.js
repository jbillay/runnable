/* user object */

var models = require('../models');

function join() {
    'use strict';
	this.id = null;
	this.nb_place = null;
	this.journey = null;
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
	if (join.nb_place) {
		this.nb_place = join.nb_place; }
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
	
	console.log('try to join for the journey : ' + that.journey_id);
	this.set(join);
	models.User.find({where: {id: user.id}})
		.success(function (user) {
			that.setUser(user);
			models.Journey.find({where: {id: that.journey_id}})
				.success(function (journey) {
					that.setJourney(journey);
					models.Join.create(that)
						.success(function(newJoin) {
							newJoin.setJourney(journey)
								.success(function () {
									newJoin.setUser(user)
										.error(function(err) {
											done(err, null);
										})
										.success(function(newJoin) {
											done(null, newJoin);
										});
								});
						});
				});
		});
};

join.prototype.getById = function (id, done) {
    'use strict';
	models.Join.find({ where: {id: id}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (join) {
			done(null, join);
		});
};

join.prototype.getByUser = function (userId, done) {
    'use strict';
	var that = this;
	models.User.find({where: {id: userId}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (user) {
			that.setUser(user);
			user.getJoins().success(function (join) {
				console.log(join);
				that.set(join);
				done(null, that);
			});
		});
};

join.prototype.getByJourney = function (journeyId, done) {
    'use strict';
	var that = this;
	models.Journey.find({ where: {id: journeyId}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (journey) {
			journey.getJoins().success(function (joins) {
				console.log(joins);
				done(null, joins);
			});
		});
};

module.exports = join;
