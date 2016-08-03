
var Run = require('../objects/run');
var Picture = require('../objects/picture');
var _ = require('lodash');
var async = require('async');

/**
 * @api {post} /api/run Create a race
 * @apiVersion 1.0.0
 * @apiName CreateRun
 * @apiGroup Run
 *
 * @apiParam {String} name Name of the race
 * @apiParam {string="trail","ultra","10k","20k","semi","marathon","triathlon"} type Type of the race
 * @apiParam {String} address_start Localization of the race start (google maps definition preferred)
 * @apiParam {String} date_start Date of the race
 * @apiParam {String} [time_start] Hour of race start
 * @apiParam {String} [distances] List of distance(s) of the race
 * @apiParam {String} [elevations] List of elevation(s) of the race
 * @apiParam {String} [info] Link of race website
 * @apiParam {String} [token] Authenticate token
 *
 * @apiSuccess {String} msg Confirmation message
 * @apiSuccess {String} type Type of return
 * @apiSuccess {Object} run New race information
 *
 * @apiSuccessExample {jsonp} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "msg": "runCreated",
 *       "type": "success",
 *       "run": "{
 *          "id": 108
 *          "name": "Maxicross",
 *          "slug": "maxicross",
 *          "type": "trail",
 *          "address_start": "Bouffemont, France",
 *          "lat": null,
 *          "lng": null,
 *          "date_start": "2016-04-16T22:00:00.000Z",
 *          "time_start": "09:15",
 *          "distances": "15k - 30k - 7k",
 *          "elevations": "500+ - 1400+",
 *          "info": "http:\/\/www.maxicross.fr",
 *          "is_active": false,
 *          "createdAt": "2015-02-04 18:55:39",
 *          "updatedAt": "2015-02-05 18:55:39",
 *          "UserId": 2,
 *          "PartnerId": 1,
 *          "pictures": [],
 *          "sticker": null
 *       }"
 *     }
 *
 * @apiError (400) {String} msg Error message
 * @apiError (400) {String} type Type of return
 *
 * @apiErrorExample {jsonp} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "msg": "At least one of the mandatory fields is missing",
 *       "type": "error"
 *     }
 *
 * @apiError (401) {String} msg Error message
 * @apiError (401) {String} type Type of return
 *
 * @apiErrorExample {jsonp} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "msg": "notAuthenticated",
 *       "type": "error"
 *     }
 *
 * @apiError (500) {String} msg Error message
 * @apiError (500) {String} type Type of return
 *
 * @apiErrorExample {jsonp} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "msg": "SQL problem",
 *       "type": "error"
 *     }
 */
exports.create = function (req, res) {
    'use strict';
	var run = new Run(),
        picture = new Picture(),
        newRun = null,
        checkout = null;
    if (req.fields) {
        // Transform fields array in string due to multipart mapping
        newRun = _.transform(req.fields, function (newRun, value, key) {
            newRun[key] = value.toString();
        });
    } else if (req.body) {
        newRun = req.body;
    }
    checkout = run.checkRunObject(newRun);
    if (checkout.type === 'error') {
        return res.jsonp(400, checkout);
    } else {
        console.log('Create the run : ' + newRun.name);
        run.save(newRun, req.user, req.partner, function (err, createdRun) {
            if (err) {
                if (err === 'Not authorized') {
                    return res.jsonp(401, {msg: err, type: 'error'});
                } else {
                    return res.jsonp(500, {msg: err, type: 'error'});
                }
            }
            if (req.files && req.files.file) {
                var q = async.queue(function (options, callback) {
                        picture.create(options.path, options.runId)
                            .then(function (img) {
                                if (options.isDefault === 'true') {
                                    picture.setDefault(img.id, options.runId)
                                        .then(function (img) {
                                            callback(null, img);
                                        })
                                        .catch(function (err) {
                                            callback(err, null);
                                        });
                                } else {
                                    callback(null, img);
                                }
                            })
                            .catch(function (err) {
                                callback(err, null);
                            });
                    }, 1),
                    fileInfo = newRun.fileInfo.split(','),
                    iterator = 0;
                req.files.file.forEach(function (file) {
                    q.push({path: file.path, runId: createdRun.id, isDefault: fileInfo[iterator]}, function (err, img) {
                        if (err) {
                            console.log(new Error('Not able to upload picture ' + file.originalFilename + ' : ' + err));
                        } else {
                            console.log('File ' + file.originalFilename + ' added');
                        }
                    });
                    iterator++;
                });
                q.drain = function () {
                    return res.jsonp(201, {msg: 'runCreated', type: 'success', run: createdRun});
                };
            } else {
                return res.jsonp(201, {msg: 'runCreated', type: 'success', run: createdRun});
            }
        });
    }
};

exports.search = function (req, res) {
    'use strict';
    var run = new Run();
    run.search(req.body, function (err, runs) {
        if (err) {
            return res.jsonp({msg: err, type: 'error'});
        }
        return res.jsonp({msg: runs, type: 'success'});
    });
};

/**
 * @api {get} /api/run/list Get list of active race
 * @apiVersion 1.0.0
 * @apiName GetActiveRun
 * @apiGroup Run
 *
 * @apiSuccess {Object} msg List of active runs
 * @apiSuccess {String} type Type of return
 *
 * @apiSuccessExample {jsonp} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "type": "success",
 *       "msg": "[
 *          {
 *              "id": 108
 *              "name": "Maxicross",
 *              "slug": "maxicross",
 *              "type": "trail",
 *              "address_start": "Bouffemont, France",
 *              "lat": null,
 *              "lng": null,
 *              "date_start": "2016-04-16T22:00:00.000Z",
 *              "time_start": "09:15",
 *              "distances": "15k - 30k - 7k",
 *              "elevations": "500+ - 1400+",
 *              "info": "http:\/\/www.maxicross.fr",
 *              "is_active": false,
 *              "createdAt": "2015-02-04 18:55:39",
 *              "updatedAt": "2015-02-05 18:55:39",
 *              "UserId": 2,
 *              "PartnerId": 1,
 *              "pictures": [],
 *              "sticker": null
 *          },{
 *              "id": 109
 *              "name": "UTPMA",
 *              "slug": "utpma",
 *              "type": "trail",
 *              "address_start": "Aurillac, France",
 *              "lat": null,
 *              "lng": null,
 *              "date_start": "2016-04-16T22:00:00.000Z",
 *              "time_start": "06:20",
 *              "distances": "16k - 44k - 101k",
 *              "elevations": "500+ - 1400+ - 4500+",
 *              "info": "http:\/\/www.utpma.fr",
 *              "is_active": 1,
 *              "createdAt": "2015-02-04 18:55:39",
 *              "updatedAt": "2015-02-05 18:55:39",
 *              "UserId": 1,
 *              "PartnerId": null,
 *              "pictures": [],
 *              "sticker": null
 *          }
 *       ]"
 *     }
 *
 * @apiError (500) {String} msg Error message
 * @apiError (500) {String} type Type of return
 *
 * @apiErrorExample {jsonp} Error-Response:
 *     HTTP/1.1 500 Bad Request
 *     {
 *       "msg": "Database connection problem",
 *       "type": "error"
 *     }
 *
 */
// Function used in the widget don t change API without update widget code
exports.activeList = function (req, res) {
    'use strict';
	console.log('Get list of active run');
	var run = new Run();
	run.getActiveList(function (err, runs) {
		if (err) {
			return res.jsonp({msg: err, type: 'error'});
		}
		return res.jsonp({msg: runs, type: 'success'});
	});
};

/**
 * @api {get} /api/run/:id Get race information
 * @apiVersion 1.0.0
 * @apiName GetRun
 * @apiGroup Run
 *
 * @apiParam {String} id Race identifier
 *
 * @apiSuccess {Object} body Race information
 *
 * @apiSuccessExample {jsonp} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *          "id": 108
 *          "name": "Maxicross",
 *          "slug": "maxicross",
 *          "type": "trail",
 *          "address_start": "Bouffemont, France",
 *          "lat": null,
 *          "lng": null,
 *          "date_start": "2016-04-16T22:00:00.000Z",
 *          "time_start": "09:15",
 *          "distances": "15k - 30k - 7k",
 *          "elevations": "500+ - 1400+",
 *          "info": "http:\/\/www.maxicross.fr",
 *          "is_active": false,
 *          "createdAt": "2015-02-04 18:55:39",
 *          "updatedAt": "2015-02-05 18:55:39",
 *          "UserId": 2,
 *          "PartnerId": 1,
 *          "pictures": [],
 *          "sticker": null
 *     }
 *
 * @apiError (400) {String} msg Error message
 * @apiError (400) {String} type Type of return
 *
 * @apiErrorExample {jsonp} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "msg": "Wrong id format",
 *       "type": "error"
 *     }
 *
 */
exports.detail = function (req, res) {
    'use strict';
	console.log('Get info on run ' + req.params.id);
	var id = _.toNumber(req.params.id);
	var run = new Run();
	run.getById(id, function (err, runDetail) {
		if (err) {
			return res.jsonp({msg: err, type: 'error'});
		}
        return res.jsonp(runDetail);
	});
};

exports.next = function (req, res) {
    'use strict';
	console.log('Get list of next run limited to ' + req.params.nb);
	var nb = _.toNumber(req.params.nb),
        run = new Run();
	run.getNextList(nb, function (err, runs) {
		if (err) {
			return res.jsonp({msg: err, type: 'error'});
		}
        return res.jsonp({msg: runs, type: 'success'});
	});
};

exports.list = function (req, res) {
    'use strict';
	console.log('Get list of run');
	var run = new Run();
	run.getList(0, function (err, runs) {
		if (err) {
			return res.jsonp({msg: err, type: 'error'});
		}
        return res.jsonp({msg: runs, type: 'success'});
	});
};

exports.toggleActive = function (req, res) {
    'use strict';
	console.log('Toggle active for run ' + req.body.id);
	var id = req.body.id,
		run = new Run();
	run.toggleActive(id, function (err, run) {
		if (err) {
			return res.jsonp({msg: err, type: 'error'});
		}
		return res.jsonp({msg: 'done', type: 'success'});
	});
};

exports.update = function (req, res) {
    'use strict';
    console.log('Update the run ' + req.body.run.id);
    var run = new Run();
    run.save(req.body.run, req.user, req.partner, function (err, run) {
        if (err) {
            return res.jsonp({msg: err, type: 'error'});
        }
        return res.jsonp({msg: 'runUpdated', type: 'success'});
    });
};