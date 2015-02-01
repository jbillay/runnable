/**
 * Created by jeremy on 31/01/15.
 */

var ValidationJourney = require('../objects/validation_journey');

exports.validate = function (req, res) {
    'use strict';
    console.log('validate the journey : ' + req.body.joinId);
    var validationObj = {
            joinId: req.body.joinId,
            userId: req.user.id,
            comment_driver: req.body.commentDriver,
            comment_service: req.body.commentService,
            rates: req.body.rates
        },
        validation = new ValidationJourney();
    validation.set(validationObj);
    validation.create(function (err, validation) {
        if (err) {
            res.jsonp(err);
        }
        res.jsonp(validation);
    });
};