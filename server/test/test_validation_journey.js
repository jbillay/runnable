/**
 * Created by jeremy on 31/01/15.
 */

"use strict";

var assert = require("chai").assert;
var models = require('../models');
var ValidationJourney = require('../objects/validation_journey');
var q = require('q');

var loadData = function (fix) {
    var deferred = q.defer();
    models[fix.model].create(fix.data)
        .complete(function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log('Insert data for : '+ fix.model);
            deferred.resolve(result);
        });
    return deferred.promise;
};

describe('Test of validation_journey object', function () {
    "use strict";
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        this.timeout(6000);
        models.sequelize.sync({force: true})
            .then(function () {
                var fixtures = require('./fixtures/test_validation_journey.json');
                var promises = [];
                fixtures.forEach(function (fix) {
                    console.log('Try to insert data in ' + fix.model);
                    promises.push(loadData(fix));
                });
                q.all(promises).then(function() {
                    done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log("Test of validation journey over !");
    });

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