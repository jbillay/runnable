/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

var Discussion= require('../objects/discussion');

exports.getUsers = function (req, res) {
    "use strict";
    var discussion = new Discussion(),
        journeyId = req.params.id;
    console.log('Get discussion users for journey : ' + journeyId);
    discussion.getUsers(journeyId, function(err, users) {
        if (err) {
            console.log('Not able to get discussion users for journey : ' + err);
            res.jsonp('{"msg": "ko"}');
        } else {
            res.jsonp(users);
        }
    });
};