/* user object */

var models = require('../models');
var distance = require('google-distance');
var slug = require('slug');
var _ = require('lodash');
var q = require('q');

function run() {
    'use strict';
	this.id = null;
	this.name = null;
	this.slug = null;
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
		this.name = run.name;
        if (run.slug) {
            this.slug = run.slug;
        } else {
            this.slug = slug(run.name, {lower: true});
        }
    }
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
    else {
        this.is_active = false;
    }
	if (user.id) {
		this.user_id = user.id; }
};

run.prototype.isPast = function (run) {
    'use strict';
    var today = new Date(),
        runStart = new Date(run.date_start);
    today.setHours(0,0,0,0);
    if (today <= runStart) {
        return false;
    }
    return true;
};

run.prototype.save = function (run, user, done) {
    'use strict';
	var that = this;
	console.log('try to save run : ' + run.name);
	models.User.find({where: {id: user.id}})
		.then(function (user) {
            that.set(run, user);
            models.Run.findOrCreate({where: {id: run.id}, defaults: that})
                .spread(function (run, created) {
                    if (created) {
                        run.setUser(user)
                            .then(function (newRun) {
                                done(null, newRun);
                            });
                    } else {
                        var updateRun = _.assign(run, that);
                        updateRun.save()
                            .then(function (updatedRun) {
                                done(null, updatedRun);
                            });
                    }
                })
                .catch(function (err) {
                    done(err, null);
                });
		});
};

run.prototype.getActiveList = function (done) {
    'use strict';
    var day = new Date(),
        that = this;
    day.setHours(0,0,0,0);
    models.Run.findAll({where: {is_active: true, date_start: {$gte: day}},
                        order: 'date_start ASC'})
		.then(function (runs) {
            that.getSticker(JSON.parse(JSON.stringify(runs)))
                .then(function (runs) {
                    done(null, runs);
                })
                .catch(function (err) {
                    done(new Error(err), null);
                });
		})
		.catch(function (err) {
			done(new Error(err), null);
		});
};

run.prototype.search = function (searchInfo, done) {
    'use strict';
	distance.apiKey = 'AIzaSyDwRGJAEBNCeZK1176FXLvVAKyt5XQXXsM';
    var searchParams = [{is_active: true}],
        that = this;
    if (searchInfo.run_name && searchInfo.run_name.length !== 0) {
        searchParams.push(models.Sequelize.where(
            models.Sequelize.fn('lower', models.Sequelize.col('name')),
            {$like: '%' + searchInfo.run_name.toLowerCase() + '%'}));
    }
    if (searchInfo.run_adv_type && searchInfo.run_adv_type.length !== 0) {
        searchParams.push({type: searchInfo.run_adv_type});
    }
    if (searchInfo.run_adv_start_date && searchInfo.run_adv_start_date.length !== 0) {
        var start_date = new Date(searchInfo.run_adv_start_date);
		if (start_date > new Date()) {
			searchParams.push({date_start: {$gte: start_date}});
		}
    } else {
        var day = new Date();
        day.setHours(0,0,0,0);
        searchParams.push({date_start: {$gte: day}});
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
            that.getSticker(JSON.parse(JSON.stringify(runs)))
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
                                var searchDistance = parseFloat(searchInfo.run_adv_distance);
                                data.forEach(function (journey, index) {
                                    if (index % iterator === 0) {
                                        var newDistance = journey.distance.substr(0, journey.distance.lastIndexOf(' ')),
                                            distanceFloat = parseFloat(newDistance);
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
                    done(new Error(err), null);
                });
        })
        .catch(function (err) {
            done(new Error(err), null);
        });
};

run.prototype.getSticker = function (runList) {
    'use strict';
    var deferred = q.defer(),
        runIdList = _.map(runList, 'id');
    models.Picture.findAll({where: {RunId: runIdList, default: true}})
        .then(function (pictureList) {
            runList.forEach(function (run) {
                pictureList.forEach(function (picture) {
                    if (picture.RunId === run.id) {
                        run.sticker = picture.link;
                    }
                });
            });
            deferred.resolve(runList);
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

run.prototype.getNextList = function (nb, done) {
    'use strict';
    var day = new Date(),
        that = this,
        limit = 0;
    if (!_.isFinite(nb) || nb < 0) {
        done(new Error('Wrong format of limit number'), null);
    } else {
        limit = nb;
    }
    day.setHours(0,0,0,0);
	models.Run.findAll({limit: limit, where: {is_active: true, date_start: {$gte: day}}, order: 'updatedAt DESC'})
		.then(function (runs) {
            that.getSticker(JSON.parse(JSON.stringify(runs)))
                .then(function (runs) {
                    done(null, runs);
                })
                .catch(function (err) {
                    done(new Error(err), null);
                });
		})
		.catch(function (err) {
			done(new Error(err), null);
		});
};

run.prototype.getById = function (id, done) {
    'use strict';
    if (!_.isFinite(id) || id < 0) {
        done(new Error('Wrong id format'), null);
    } else {
        models.Run.find({where: {id: id}})
            .then(function (run) {
                models.Picture.findAll({where: {RunId: run.id}})
                    .then(function (pictures) {
                        var newRun = run.get();
                        newRun.pictures = [];
                        newRun.sticker = null;
                        pictures.forEach(function (picture) {
                            if (picture.default) {
                                newRun.sticker = picture.link;
                            } else {
                                newRun.pictures.push(picture.link);
                            }
                        });
                        done(null, newRun);
                    })
                    .catch(function (err) {
                        done(new Error(err), null);
                    });
            })
            .catch(function (err) {
                done(new Error(err), null);
            });
    }
};

run.prototype.getList = function (old_run, done) {
    'use strict';
    var day = new Date();
    day.setHours(0,0,0,0);
    var that = this;
    var where = {date_start: {$gte: day}};
	if (old_run === 1) where = {};
	models.Run.findAll({where: [where],
						order: 'date_start ASC'})
		.then(function (runs) {
            that.getSticker(JSON.parse(JSON.stringify(runs)))
                .then(function (runs) {
                    done(null, runs);
                })
                .catch(function (err) {
                    done(new Error(err), null);
                });
		})
		.catch(function (err) {
			done(new Error(err), null);
		});
};

run.prototype.toggleActive = function (id, done) {
    'use strict';
	models.Run.find({where: {id: id}})
		.then(function (run) {
            if (!run) {
                done(new Error('Run not found'), null);
            } else {
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
            }
        })
		.catch(function (err) {
			done(err, null);
		});
};

module.exports = run;
