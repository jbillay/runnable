
var Journey = require('../objects/journey');

exports.create = function (req, res, next) {
    'use strict';
	console.log('Create a journey for run : ' + req.body.journey.Run.id);
	var journey = new Journey();
    req.Run = req.body.journey.Run;
    req.draft = 0;
    if (!req.isAuthenticated()) {
        req.draft = 1;
        journey.draft(req.body.journey, function (err, journeyKey) {
            if (err) {
                console.log('Draft Journey not created ' + err);
                return res.jsonp({msg: 'draftJourneyNotCreated', type: 'error'});
            } else {
                console.log('Draft Journey created with key : ', journeyKey);
                res.jsonp({msg: 'draftJourneyCreated', type: 'success', journeyKey: journeyKey});
            }
            err = null;
            journeyKey = null;
        });
        journey = null;
    } else {
        journey.save(req.body.journey, req.user.id, req.user.role, function (err, journey, run) {
            if (err) {
                console.log('Journey not created ' + err);
                return res.jsonp({msg: 'journeyNotCreated', type: 'error'});
            } else {
                console.log('Journey created');
                res.jsonp({msg: 'journeyCreated', type: 'success', journey: journey});
                req.Run = run;
                req.Journey = journey;
                next();
            }
            err = null;
            journey = null;
        });
        journey = null;
    }
};

/**
 * @api {post} /api/journey/confirm Confirm journey created
 * @apiVersion 1.0.0
 * @apiName JourneyConfirm
 * @apiGroup Journey
 *
 * @apiParam {String} key Key provide when the journey is created
 * @apiParam {String} [token] Authenticate token
 * @apiHeader {String} [x-access-token] Authenticate token
 *
 * @apiSuccess {String} msg Confirmation message
 * @apiSuccess {String} type Type of return
 * @apiSuccess {Object} run New race information
 *
 * @apiSuccessExample {jsonp} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "msg": "draftJourneySaved",
 *       "type": "success",
 *       "journey": "{
 *          "id": 18,
 *          "address_start": "64200 Biarritz, France",
 *          "lat": "43.4831519",
 *          "lng": "-1.558626",
 *          "distance": "834 km",
 *          "duration": "7 heures 31 minutes",
 *          "journey_type": "aller-retour",
 *          "date_start_outward": "2016-10-15T22:00:00.000Z",
 *          "time_start_outward": "10:10",
 *          "nb_space_outward": 6,
 *          "date_start_return": "2016-10-22T22:00:00.000Z",
 *          "time_start_return": "22:52",
 *          "nb_space_return": 4,
 *          "car_type": "monospace",
 *          "amount": 34,
 *          "is_payed": false,
 *          "is_canceled": false,
 *          "createdAt": "2016-06-22T11:37:31.000Z",
 *          "updatedAt": "2016-06-22T11:37:31.000Z",
 *          "RunId": 3,
 *          "UserId": 1,
 *          "PartnerId": null,
 *          "Joins": []
 *       }"
 *     }
 *
 * @apiError (400) {String} msg Error message
 * @apiError (400) {String} type Type of return
 *
 * @apiErrorExample {jsonp} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "msg": "Missing key",
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
exports.confirm = function (req, res, next) {
    'use strict';
    console.log('Confirm the journey with key : ' + req.body.key);
    var journey = new Journey();
    journey.saveDraft(req.body.key, req.user.id, function (err, newJourney) {
        if (err) {
            return res.jsonp({msg: 'draftJourneyNotSaved', type: 'error'});
        } else {
            req.Run = newJourney.Run;
            req.Journey = newJourney;
            res.jsonp({msg: 'draftJourneySaved', type: 'success', journey: newJourney});
            next();
        }
        err = null;
        journey = null;
    });
    journey = null;
};

exports.update = function (req, res, next) {
    'use strict';
    console.log('Update the journey for run : ' + req.body.journey.id);
    var journey = new Journey();
    if (req.user.id === req.body.journey.UserId || req.user.role === 'admin') {
        journey.save(req.body.journey, req.body.journey.UserId, req.user.role, function (err, journey, run) {
            if (err) {
                console.log('Journey not updated ' + err);
                res.jsonp({msg: 'journeyNotUpdated', type: 'error'});
            } else {
                console.log('Journey updated');
                req.Run = run;
                req.Journey = journey;
                res.jsonp({msg: 'journeyUpdated', type: 'success'});
                next();
            }
            err = null;
            journey = null;
        });
    } else {
        console.log('Journey not created : ' + new Error('Not allow to update journey'));
        res.jsonp({msg: 'notAllowToUpdate', type: 'error'});
    }
    journey = null;
};

exports.list = function (req, res) {
    'use strict';
	console.log('Get list of journey');
	var journey = new Journey();
	journey.getList(0, function (err, journeys) {
		if (err) {
			console.log('Not able to get journey list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(journeys);
		}
        err = null;
        journeys = null;
	});
    journey = null;
};

exports.openList = function (req, res) {
    'use strict';
    console.log('Get list of open journey');
    var journey = new Journey();
    journey.getOpenList(function (err, journeys) {
        if (err) {
            console.log('Not able to get journey list : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(journeys);
        }
        err = null;
        journeys = null;
    });
    journey = null;
};


/**
 * @api {get} /api/journey/run/:id Journeys for a race
 * @apiVersion 1.0.0
 * @apiName GetJourneyRun
 * @apiGroup Journey
 *
 * @apiParam {String} id Race identifier
 *
 * @apiSuccess {Object} body List of journeys for the race
 *
 * @apiSuccessExample {jsonp} Success-Response:
 *     HTTP/1.1 200 OK
 *      [
 *          {
 *              "id": 5,
 *              "address_start": "Toulon, France",
 *              "lat": "43.124228",
 *              "lng": "5.928",
 *              "distance": "839 km",
 *              "duration": "7 heures 31 minutes",
 *              "journey_type": "aller",
 *              "date_start_outward": "2016-11-01T23:00:00.000Z",
 *              "time_start_outward": "03:00",
 *              "nb_space_outward": 4,
 *              "date_start_return": null,
 *              "time_start_return": null,
 *              "nb_space_return": null,
 *              "car_type": "citadine",
 *              "amount": 23,
 *              "is_payed": true,
 *              "is_canceled": false,
 *              "createdAt": "2016-06-05T08:06:45.000Z",
 *              "updatedAt": "2016-07-13T20:49:36.000Z",
 *              "RunId": 3,
 *              "UserId": 1,
 *              "PartnerId": null,
 *              "Joins": [],
 *             "Run": {
 *               "id": 3,
 *               "name": "Paris Saint Germain",
 *               "slug": "paris-saint-germain",
 *               "type": "20k",
 *               "address_start": "Paris, France",
 *               "lat": null,
 *               "lng": null,
 *               "date_start": "2017-05-11T22:00:00.000Z",
 *               "time_start": "08:00",
 *               "distances": "20Km",
 *               "elevations": "150+",
 *               "info": "http:\/\/wwww.parisstgermain.fr",
 *               "is_active": true,
 *               "createdAt": "2015-02-20T17:55:39.000Z",
 *               "updatedAt": "2016-06-05T08:06:45.000Z",
 *               "UserId": 1,
 *               "PartnerId": null
 *             }
 *           },
 *           {
 *             "id": 6,
 *             "address_start": "19000 Tulle, France",
 *             "lat": "45.26565",
 *             "lng": "1.771697",
 *             "distance": "478 km",
 *             "duration": "4 heures 30 minutes",
 *             "journey_type": "aller-retour",
 *             "date_start_outward": "2017-07-01T22:00:00.000Z",
 *             "time_start_outward": "11:10",
 *             "nb_space_outward": 2,
 *             "date_start_return": "2017-07-02T22:00:00.000Z",
 *             "time_start_return": "09:30",
 *             "nb_space_return": 4,
 *             "car_type": "citadine",
 *             "amount": 12,
 *             "is_payed": false,
 *             "is_canceled": false,
 *             "createdAt": "2016-06-22T11:06:37.000Z",
 *             "updatedAt": "2016-06-22T11:06:37.000Z",
 *             "RunId": 3,
 *             "UserId": 1,
 *             "PartnerId": null,
 *             "Joins": [],
 *             "Run": {
 *               "id": 3,
 *               "name": "Paris Saint Germain",
 *               "slug": "paris-saint-germain",
 *               "type": "20k",
 *               "address_start": "Paris, France",
 *               "lat": null,
 *               "lng": null,
 *               "date_start": "2017-05-11T22:00:00.000Z",
 *               "time_start": "08:00",
 *               "distances": "20Km",
 *               "elevations": "150+",
 *               "info": "http:\/\/wwww.parisstgermain.fr",
 *               "is_active": true,
 *               "createdAt": "2015-02-20T17:55:39.000Z",
 *               "updatedAt": "2016-06-05T08:06:45.000Z",
 *               "UserId": 1,
 *               "PartnerId": null
 *             }
 *           }
 *      ]
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
exports.listForRun = function (req, res) {
    'use strict';
	console.log('Get list of journey for run ' + req.params.id);
	var id = req.params.id,
        journey = new Journey();
    journey.getListForRun(id, function (err, journeys) {
        if (err) {
            console.log('Not able to get journey list : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(journeys);
        }
        err = null;
        journeys = null;
    });
    id = null;
    journey = null;
};

exports.detail = function (req, res) {
    'use strict';
	console.log('Get info on journey ' + req.params.id);
	var id = req.params.id;
	var journey = new Journey();
	journey.getById(id, function (err, journeyDetail) {
		if (err) {
			console.log('Not able to get info on the journey : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(journeyDetail);
		}
        err = null;
        journeyDetail = null;
	});
    id = null;
    journey = null;
};

exports.next = function (req, res) {
    'use strict';
	console.log('Get list of next journey limited to ' + req.params.nb);
	var journey = new Journey();
	journey.getNextList(req.params.nb, function (err, runs) {
		if (err) {
			console.log('Not able to get journey list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(runs);
		}
        err = null;
        runs = null;
	});
    journey = null;
};

exports.bookSpace = function (req, res) {
	'use strict';
	var journeyId = req.params.id;
	console.log('Get book space for journey ' + journeyId);
	var journey = new Journey();
	journey.getBookSpace(journeyId, function (err, spaces) {
		if (err) {
			console.log('Not able to get book space : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(spaces);
		}
        err = null;
        spaces = null;
	});
    journeyId = null;
    journey = null;
};

exports.togglePayed = function (req, res) {
    'use strict';
    console.log('Toggle payed for journey ' + req.body.id);
    var id = req.body.id,
        journey = new Journey();
    journey.togglePayed(id, function (err, journey) {
        if (err) {
            console.log('Journey not toggle payed ' + err);
            res.jsonp({msg: 'journeyNotTogglePayed', type: 'error'});
        } else {
            console.log('Journey toggle payed');
            res.jsonp({msg: 'journeyTogglePayed', type: 'success'});
        }
        err = null;
        journey = null;
    });
    id = null;
    journey = null;
};

exports.cancel = function (req, res) {
    'use strict';
    var id = req.body.id,
        journey = new Journey();
    console.log('Try to cancel journey ' + id);
    journey.cancel(id, function (err, journey) {
        if (err) {
            console.log('Journey not canceled : ' + err);
            res.jsonp({msg: 'journeyNotCanceled', type: 'error'});
        } else {
            console.log('Journey canceled');
            res.jsonp({msg: 'journeyCanceled', type: 'success'});
        }
        err = null;
        journey = null;
    });
    id = null;
    journey = null;
};

exports.notifyJoin = function (req, res) {
    'use strict';
    var journey = new Journey();

    journey.notifyJoin(req.invoice, function (err, result) {
        if (err) {
            console.log(new Error('User and Driver not notified : ' + err));
        } else  {
            console.log('User and Driver ' + result);
        }
    });
};

exports.toPay = function (req, res) {
    'use strict';
    var journey = new Journey();

    journey.toPay()
        .then(function (journeys) {
            return res.jsonp({msg: journeys, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.notifyJoinedModification = function (req, res) {
    'use strict';
    var journey = new Journey();

    journey.notifyJoinedModification(req.Journey, req.Run, function (err, result) {
        if (err) {
            console.log(new Error('Journey Modification - User not notified : ' + err));
            return res.send(401);
        } else  {
            console.log('Journey Modification - User notified');
            return res.send(200);
        }
    });
};