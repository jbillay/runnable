/**
 * Created by jeremy on 25/01/15.
 */

var Participate = require('../objects/participate');

exports.add = function (req, res) {
    'use strict';
    var participate = new Participate(),
        runId = req.body.runId,
        user = req.user;
    participate.add(runId, user, function (err) {
        if (err) {
            res.jsonp('{"msg": "notAbleParticipate", "type": "error"}');
        }
        res.json('{"msg": "addParticipate", "type": "success"}');
    });
};

exports.userList = function (req, res) {
    'use strict';
    var participate = new Participate(),
        userId = req.user.id;
    participate.userList(userId, function (err, participation) {
        if (err) {
            res.jsonp('{"msg": "participateList", "type": "error"}');
        }
        res.jsonp(participation);
    });
};

exports.runList = function (req, res) {
    'use strict';
    var participate = new Participate(),
        runId = req.params.id;
    participate.runList(runId, function (err, participation) {
        if (err) {
            res.jsonp('{"msg": "participateList", "type": "error"}');
        }
        res.jsonp(participation);
    });
};