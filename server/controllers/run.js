
var Run = require('../objects/run');

exports.create = function (req, res) {
    'use strict';
	console.log('Create the run : ' + req.body.run.name);
	var run = new Run();
	run.set(req.body.run, req.user);
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

exports.activeList = function (req, res) {
    'use strict';
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

exports.detail = function (req, res) {
    'use strict';
	console.log('Get info on run ' + req.params.id);
	var id = req.params.id;
	var run = new Run();
	run.getById(id, function (err, runDetail) {
		if (err) {
			console.log('Not able to get info on the run : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			res.jsonp(runDetail);
		}
	});
};

exports.next = function (req, res) {
    'use strict';
	console.log('Get list of next run limited to ' + req.params.nb);
	var run = new Run();
	run.getNextList(req.params.nb, function (err, runs) {
		if (err) {
			console.log('Not able to get active run list : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else {
			res.jsonp(runs);
		}
	});
};

exports.list = function (req, res) {
    'use strict';
	console.log('Get list of run');
	var run = new Run();
	run.getList(function (err, runs) {
		if (err) {
			console.log('Not able to get run list : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else {
			res.jsonp(runs);
		}
	});
};

exports.toggleActive = function (req, res) {
    'use strict';
	console.log('Toggle active for run ' + req.body.id);
	var id= req.body.id,
		run = new Run();
	run.toggleActive(id, function (err, run) {
		if (err) {
			console.log('Not able to get info on the run : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else {
			res.jsonp('{"msg": "done"}');
		}
	});
};
