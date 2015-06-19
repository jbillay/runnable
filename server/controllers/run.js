
var Run = require('../objects/run');

exports.create = function (req, res) {
    'use strict';
	console.log('Create the run : ' + req.body.run.name);
	var run = new Run();
	run.save(req.body.run, req.user, function (err, run) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp({msg: 'runCreated', type: 'success'});
        }
		err = null;
		run = null;
	});
	run = null;
};

exports.search = function (req, res) {
    'use strict';
    var run = new Run();
    run.search(req.body, function (err, runs) {
        if (err) {
            console.log('Not able to search run : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(runs);
        }
		err = null;
		runs = null;
    });
	run = null;
};

exports.activeList = function (req, res) {
    'use strict';
	console.log('Get list of active run');
	var run = new Run();
	run.getActiveList(function (err, runs) {
		if (err) {
			console.log('Not able to get active list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(runs);
		}
		err = null;
		runs = null;
	});
	run = null;
};

exports.detail = function (req, res) {
    'use strict';
	console.log('Get info on run ' + req.params.id);
	var id = req.params.id;
	var run = new Run();
	run.getById(id, function (err, runDetail) {
		if (err) {
			console.log('Not able to get info on the run : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(runDetail);
		}
		err = null;
		runDetail = null;
	});
	run = null;
	id = null;
};

exports.next = function (req, res) {
    'use strict';
	console.log('Get list of next run limited to ' + req.params.nb);
	var run = new Run();
	run.getNextList(req.params.nb, function (err, runs) {
		if (err) {
			console.log('Not able to get active run list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(runs);
		}
		err = null;
		runs = null;
	});
	run = null;
};

exports.list = function (req, res) {
    'use strict';
	console.log('Get list of run');
	var run = new Run();
	run.getList(0, function (err, runs) {
		if (err) {
			console.log('Not able to get run list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(runs);
		}
		err = null;
		runs = null;
	});
	run = null;
};

exports.toggleActive = function (req, res) {
    'use strict';
	console.log('Toggle active for run ' + req.body.id);
	var id = req.body.id,
		run = new Run();
	run.toggleActive(id, function (err, run) {
		if (err) {
			console.log('Not able to get info on the run : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp({msg: 'done', type: 'success'});
		}
		err = null;
		run = null;
	});
	id = null;
	run = null;
};

exports.update = function (req, res) {
    'use strict';
    console.log('Update the run ' + req.body.run.id);
    var run = new Run();
    run.save(req.body.run, req.user, function (err, run) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp({msg: 'runUpdated', type: 'success'});
        }
		err = null;
		run = null;
    });
	run = null;
};