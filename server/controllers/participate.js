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

