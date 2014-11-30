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

join.prototype.getByUser = function (userId, done) {
    'use strict';
	var that = this;
	models.User.find({where: {id: userId}})
		.then(function (user) {
			that.setUser(user);
			user.getJoins().then(function (join) {
				console.log(join);
				that.set(join);
				done(null, that);
			});
		})
		.catch(function (err) {
			done(err, null);
		});
};

join.prototype.getByJourney = function (journeyId, done) {
    'use strict';
	var that = this;
	models.Journey.find({ where: {id: journeyId}})
		.then(function (journey) {
			journey.getJoins().then(function (joins) {
				console.log(joins);
				done(null, joins);
			});
		})
		.catch(function (err) {
			done(err, null);
		});
};

module.exports = join;
