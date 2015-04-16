
var Journey = require('../objects/journey');

exports.create = function (req, res) {
    'use strict';
	console.log('Create a journey for run : ' + req.body.journey.run_id);
	var journey = new Journey();
	journey.save(req.body.journey, req.user, function (err, journey) {
		if (err) {
            console.log('Journey not created ' + err);
            res.jsonp('{"msg": "journeyNotCreated", "type": "error"}');
		} else {
            console.log('Journey created');
            res.jsonp('{"msg": "journeyCreated", "type": "success"}');
		}
	});
};

exports.list = function (req, res) {
    'use strict';
	console.log('Get list of journey');
	var journey = new Journey();
	journey.getList(function (err, journeys) {
		if (err) {
			console.log('Not able to get journey list : ' + err);
			res.jsonp('{"msg": "ko"}');
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
            res.jsonp('{"msg": "ko"}');
        } else {
            res.jsonp(journeys);
        }
    });
};

exports.listForRun = function (req, res) {
    'use strict';
	console.log('Get list of journey for run' + req.params.id);
	var journey = new Journey();
	journey.getListForRun(req.params.id, function (err, journeys) {
		if (err) {
			console.log('Not able to get journey list : ' + err);
			res.jsonp('{"msg": "ko"}');
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
			res.jsonp('{"msg": "ko"}');
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
			res.jsonp('{"msg": "ko"}');
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
			res.jsonp('{"msg": "ko"}');
		} else {
			res.jsonp(spaces);
		}
	});
};