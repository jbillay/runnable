/* user object */

var db = require('../models');

function journey() {
    'use strict';
	this.id = null;
	this.run_id = null;
	this.address_start = null;
	this.distance = null;
	this.duration = null;
    this.date_start= null;
    this.time_start = null;
	this.car_type = null;
	this.nb_space = null;
	this.amount = null;
	this.owner_id = null;
}

journey.prototype.get = function () {
    'use strict';
	return this;
};

journey.prototype.set = function (journey) {
    'use strict';
	if (journey.id) {
		this.id = journey.id; }
	if (journey.run_id) {
		this.run_id = journey.run_id; }
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
	if (journey.owner_id) {
		this.owner_id = journey.owner_id; }
};

journey.prototype.save = function (done) {
    'use strict';
	console.log('try to create journey for run: ' + this.run_id);
	global.db.models.journey.create(this, function (err, newJourney) {
		if (err) {
			done(err, null);
		} else {
			done(null, newJourney);
		}
	});
};

journey.prototype.getList = function (done) {
    'use strict';
	global.db.models.journey.find({}, function (err, journeys) {
		if (err) {
			done(err, null);
		}
        done(null, journeys);
	});
};

journey.prototype.getListForRun = function (id, done) {
    'use strict';
	global.db.models.journey.find({run_id: id}, function (err, journeys) {
		if (err) {
			done(err, null);
		}
        done(null, journeys);
	});
};

journey.prototype.getById = function (id, done) {
    'use strict';
	global.db.models.journey.find({id: id}, function (err, journey) {
		if (err) {
			done(err, null);
		}
        done(null, journey[0]);
	});
};

module.exports = journey;
