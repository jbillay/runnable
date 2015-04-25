
var Journey = require('../objects/journey');

exports.create = function (req, res) {
    'use strict';
	console.log('Create a journey for run : ' + req.body.journey.run_id);
	var journey = new Journey();
	journey.save(req.body.journey, req.user.id, function (err, journey) {
		if (err) {
            console.log('Journey not created ' + err);
            res.jsonp({msg: 'journeyNotCreated', type: 'error'});
		} else {
            console.log('Journey created');
            res.jsonp({msg: 'journeyCreated', type: 'success'});
		}
	});
};

exports.update = function (req, res) {
    'use strict';
    console.log('Update the journey for run : ' + req.body.journey.id);
    var journey = new Journey();
    if (req.user.id === req.body.journey.UserId || req.user.role === 'admin') {
        journey.save(req.body.journey, req.body.journey.UserId, function (err, journey) {
            if (err) {
                console.log('Journey not updated ' + err);
                res.jsonp({msg: 'journeyNotUpdated', type: 'error'});
            } else {
                console.log('Journey updated');
                res.jsonp({msg: 'journeyUpdated', type: 'success'});
            }
        });
    } else {
        console.log('Journey not created : ' + new Error('Not allow to update journey'));
        res.jsonp({msg: 'notAllowToUpdate', type: 'error'});
    }
};

exports.list = function (req, res) {
    'use strict';
	console.log('Get list of journey');
	var journey = new Journey();
	journey.getList(function (err, journeys) {
		if (err) {
			console.log('Not able to get journey list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(journeys);
		}
	});
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
    });
};

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
    });
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
	});
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
	});
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
	});
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
    });
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
    });
};