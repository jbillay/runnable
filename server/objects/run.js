/* user object */

var models = require('../models');

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
	this.user_id = null;
}

run.prototype.get = function () {
    'use strict';
	return this;
};

run.prototype.set = function (run, user) {
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
	if (user.id) {
		this.user_id = user.id; }
};

run.prototype.save = function (done) {
    'use strict';
	var that = this;
	console.log('try to create run : ' + this.name);
	models.User.find({where: {id: this.user_id}})
		.success(function (user) {
			models.Run.create(that)
				.success(function(newRun) {
					newRun.setUser(user)
						.error(function(err) {
							done(err, null);
						})
						.success(function(newRun) {
							done(null, newRun);
						});
				});
		});
};

run.prototype.getActiveList = function (done) {
    'use strict';
	models.Run.findAll({where: {is_active: true}}).
		error(function (err) {
			done(err, null);
		})
		.success(function (runs) {
			done(null, runs);
		});
};

run.prototype.getNextList = function (nb, done) {
    'use strict';
	models.Run.findAll({limit: nb, where: {is_active: true}, order: 'updatedAt ASC '}).
		error(function (err) {
			done(err, null);
		})
		.success(function (runs) {
			done(null, runs);
		});
};

run.prototype.getById = function (id, done) {
    'use strict';
	models.Run.find({where: {id: id}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (run) {
			done(null, run);
		});
};

run.prototype.getResumeById = function (id) {
    'use strict';
	models.Run.find({where: {id: id}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (run) {
			done(null, run);
		});
};

module.exports = run;
