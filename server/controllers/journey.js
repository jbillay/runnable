
var Journey = require('../objects/journey');

exports.create = function (req, res) {
    "use strict";
	console.log('Create a journey for run : ' + req.body.journey.run_id);
	var journey = new Journey();
	journey.save(req.body.journey, function (err, journey) {
		if (err) {
			console.log('Journey not created ' + err);
			res.redirect('/journey');
		} else {
			console.log('Journey created');
			res.redirect('/journey');
		}
	});
};

exports.list = function (req, res) {
    "use strict";
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

exports.listForRun = function (req, res) {
    "use strict";
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
    "use strict";
	console.log('Get info on journey ' + req.params.id);
	var id = req.params.id;
	var journey = new Journey();
	journey.getById(id, function (err, journeyDetail) {
		if (err) {
			console.log('Not able to get info on the journey : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			console.log(journeyDetail);
			res.jsonp(journeyDetail);
		}
	});
};
