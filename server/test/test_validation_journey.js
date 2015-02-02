/**
 * Created by jeremy on 31/01/15.
 */

"use strict";

var assert = require("chai").assert;
var ValidationJourney= require('../objects/validation_journey');

describe('Test of validation_journey object', function () {
    "use strict";
    it('Get feedback on service', function (done) {
        var val = new ValidationJourney();
        val.getUserFeedback(function (err, feedback) {
            if (err) return done(err);
            assert.equal(feedback.length, 1);
            assert.equal(feedback[0].rate_service, 5);
            assert.equal(feedback[0].UserId, 1);
            done();
        });
    });
});