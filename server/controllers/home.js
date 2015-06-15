/**
 * Created by jeremy on 02/02/15.
 */

'use strict';

var ValidationJourney = require('../objects/validation_journey');

exports.userFeedback = function (req, res) {
    var validation = new ValidationJourney();
    console.log('get user feedback');
    validation.getUserFeedback(function (err, feedbacks) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(feedbacks);
        }
        err = null;
        feedbacks = null;
    });
    validation = null;
};