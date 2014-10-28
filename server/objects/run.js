/* user object */

var db = require('../models');

function run() {
    'use strict';
	this.id = null;
	this.name = null;
	this.type = null;
	this.address_start = null;
    this.date_start= null;
    this.time_start = null;
	this.distances = null;
	this.elevations = null;
	this.info = null;
	this.is_active = null;
	this.owner_id = null;
}

run.prototype.get = function () {
    'use strict';
	return this;
};

run.prototype.set = function (run) {
    'use strict';
	if (run.id) {
		this.id = run.id; }
	if (run.name) {
		this.name = run.name; }
	if (run.type) {
		this.type = run.type; }
	if (run.address_start) {
		this.address_start = run.address_start; }
	if (run.date_start) {
		this.date_start = run.date_start; }
	if (run.time_start) {
		this.time_start = run.time_start; }
	if (run.distances) {
		this.distances = run.distances; }
	if (run.elevations) {
		this.elevations = run.elevations; }
	if (run.info) {
		this.info = run.info; }
	if (run.is_active) {
		this.is_active = run.is_active; }
	if (run.owner_id) {
		this.owner_id = run.owner_id; }
};

run.prototype.save = function (done) {
    'use strict';
	console.log('try to create run : ' + this.name);
	global.db.models.run.create(this, function (err, newRun) {
		if (err) {
			done(err, null);
		} else {
			done(null, newRun);
		}
	});
};

run.prototype.getActiveList = function (done) {
    'use strict';
	global.db.models.run.find({is_active: true}, function (err, runs) {
		if (err) {
			done(err, null);
		}
        done(null, runs);
	});
};

run.prototype.getById = function (id, done) {
    'use strict';
	global.db.models.run.find({id: id}, function (err, user) {
		if (err) {
			done(err, null);
		}
        done(null, user[0]);
	});
};

module.exports = run;
