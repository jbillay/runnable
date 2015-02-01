/**
 * Created by jeremy on 31/01/15.
 */

"use strict";

var assert = require("chai").assert;
var User = require('../objects/user');

describe('Test of user object', function () {
    "use strict";
    it('Get feedback on driver', function (done) {
        var user = new User();
        user.getPublicDriverInfo(1, function (err, feedback) {
            if (err) return done(err);
            assert.equal(feedback.length, 1);
            assert.equal(feedback[0].rates, 3);
            assert.equal(feedback[0].UserId, 1);
            done();
        });
    });
});