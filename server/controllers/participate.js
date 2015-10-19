/**
 * Created by jeremy on 25/01/15.
 */

var Participate = require('../objects/participate');

exports.add = function (req, res) {
    'use strict';
    var participate = new Participate(),
        runId = req.body.runId,
        user = req.user;
    participate.add(runId, user, function (err, participate) {
        if (err) {
            res.jsonp({msg: 'notAbleParticipate', type: 'error'});
        } else {
			res.json({msg: 'addParticipate', type: 'success'});
		}
        err = null;
        participate = null;
    });
    participate = null;
    runId = null;
    user = null;
};

exports.userList = function (req, res) {
    'use strict';
    var participate = new Participate(),
        userId = req.user.id;
    participate.userList(userId, function (err, participation) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
			res.jsonp(participation);
		}
        err = null;
        participation = null;
    });
    participate = null;
    userId = null;
};

exports.userRunList = function (req, res) {
    'use strict';
    var participate = new Participate(),
        runId = req.params.id;
    participate.userRunList(runId, function (err, participation) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
			res.jsonp(participation);
		}
        err = null;
        participation = null;
    });
    participate = null;
    runId = null;
};

exports.notify = function (req, res) {
    'use strict';
    console.log('Notify users following the run : ' + req.Run.id);
    var participate = new Participate(),
        run = req.Run;
    if (!req.draft) {
        participate.notify(run, function (err, notif) {
            err = null;
            notif = null;
        });
        participate = null;
        run = null;
    }
};