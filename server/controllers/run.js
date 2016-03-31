
var Run = require('../objects/run');
var Picture = require('../objects/picture');
var _ = require('lodash');
var async = require('async');

exports.create = function (req, res) {
    'use strict';
	var run = new Run(),
        picture = new Picture();
    // Transform fields array in string due to multipart mapping
    var newRun = _.transform(req.fields, function (newRun, value, key) {
        newRun[key] = value.toString();
    });
    console.log('Create the run : ' + newRun.name);
	run.save(newRun, req.user, function (err, run) {
        if (err) {
            return res.jsonp({msg: err, type: 'error'});
        }
        if (req.files.file) {
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
                q.push({path: file.path, runId: run.id, isDefault: fileInfo[iterator]}, function (err, img) {
                    if (err) {
                        console.log(new Error('Not able to upload picture ' + file.originalFilename));
                    } else {
                        console.log('File ' + file.originalFilename + ' added');
                    }
                });
                iterator++;
            });
            q.drain = function () {
                return res.jsonp({msg: 'runCreated', type: 'success'});
            };
        } else {
            return res.jsonp({msg: 'runCreated', type: 'success'});
        }
	});
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

// Function used in the widget don t change API without update widget code
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
    run.save(req.body.run, req.user, function (err, run) {
        if (err) {
            return res.jsonp({msg: err, type: 'error'});
        }
        return res.jsonp({msg: 'runUpdated', type: 'success'});
    });
};