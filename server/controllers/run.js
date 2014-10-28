
var Run = require('../objects/run');

exports.create = function (req, res) {
    "use strict";
	console.log('Create the run : ' + req.body.run.name);
	var run = new Run();
	run.set(req.body.run);
	run.save(function (err, run) {
		if (err) {
			console.log('Run not created ' + err);
			res.redirect('/run');
		} else {
			console.log('Run created');
			res.redirect('/run');
		}
	});
};

exports.list = function (req, res) {
    "use strict";
	console.log('Get list of active run');
	var run = new Run();
	run.getActiveList(function (err, runs) {
		if (err) {
			console.log('Not able to get active list : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			res.jsonp(runs);
		}
	});
};
