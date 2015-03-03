/* user object */

var models = require('../models');
var distance = require('google-distance');

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
		.then(function (user) {
			models.Run.create(that)
				.then(function(newRun) {
					newRun.setUser(user)
						.then(function(newRun) {
							done(null, newRun);
						})
						.catch(function(err) {
							done(err, null);
						});
				});
		});
};

run.prototype.getActiveList = function (done) {
    'use strict';
	models.Run.findAll({where: {is_active: true},
                        order: 'date_start ASC'})
		.then(function (runs) {
			done(null, runs);
		})
		.catch(function (err) {
			done(err, null);
		});
};

run.prototype.search = function (searchInfo, done) {
    'use strict';
	distance.apiKey = 'AIzaSyDwRGJAEBNCeZK1176FXLvVAKyt5XQXXsM';
    var searchParams = [{is_active: true}];
    console.log('SearchInfo : %j', searchInfo);
    if (searchInfo.run_name && searchInfo.run_name.length !== 0) {
        searchParams.push('lower(name) LIKE lower("%' + searchInfo.run_name + '%")');
    }
    if (searchInfo.run_adv_type && searchInfo.run_adv_type.length !== 0) {
        searchParams.push({type: searchInfo.run_adv_type});
    }
    if (searchInfo.run_adv_start_date && searchInfo.run_adv_start_date.length !== 0) {
        var start_date = new Date(searchInfo.run_adv_start_date);
        searchParams.push({date_start: {$gte: start_date}});
    }
    if (searchInfo.run_adv_end_date && searchInfo.run_adv_end_date.length !== 0) {
        var end_date = new Date(searchInfo.run_adv_end_date);
        searchParams.push({date_start: {$lte: end_date}});
    }
    models.Run.findAll({
        where: {
            $and: [searchParams]
        }})
        .then(function (runs) {
			var filterRuns = [],
				iterator = runs.length;
			if (searchInfo.run_adv_city && searchInfo.run_adv_distance) {
				var origins = [],
					destinations = [];
				runs.forEach(function (run) {
					origins.push(run.address_start);
					destinations.push(searchInfo.run_adv_city);
				});
				var options = {
					origins: origins,
					destinations: destinations
				};
				distance.get(options, function(err, data) {
					if (err) return done(err);
					if (data.length) {
						data.forEach(function (journey, index) {
							if (index % iterator === 0) {
								var newDistance = journey.distance.substr(0, journey.distance.lastIndexOf(' ')),
								    distanceFloat = parseFloat(newDistance),
                                    searchDistance = parseFloat(searchInfo.run_adv_distance);
								if (distanceFloat <= searchDistance) {
									filterRuns.push(runs[index / iterator]);
								}
							}
						});
					}
                    done(null, filterRuns);
                });
			} else {
                done(null, runs);
            }
        })
        .catch(function (err) {
            done(err, null);
        });
};

run.prototype.getNextList = function (nb, done) {
    'use strict';
	models.Run.findAll({limit: nb, where: {is_active: true}, order: 'updatedAt ASC '})
		.then(function (runs) {
			done(null, runs);
		})
		.catch(function (err) {
			done(err, null);
		});
};

run.prototype.getById = function (id, done) {
    'use strict';
	models.Run.find({where: {id: id}})
		.then(function (run) {
			done(null, run);
		})
		.catch(function (err) {
			done(err, null);
		});
};

run.prototype.getList = function (done) {
    'use strict';
	models.Run.findAll()
		.then(function (runs) {
			done(null, runs);
		})
		.catch(function (err) {
			done(err, null);
		});
};

run.prototype.toggleActive = function (id, done) {
    'use strict';
	models.Run.find({where: {id: id}})
		.then(function (run) {
			if (run.is_active === true) {
				run.is_active = false;
			} else {
				run.is_active = true;
			}
			run.save()
                .then(function (run) {
				    done(null, run);
    			})
                .catch(function (err) {
                    done(err, null);
                });
		})
		.catch(function (err) {
			done(err, null);
		});
};

module.exports = run;
