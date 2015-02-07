/**
 * Created by jeremy on 31/01/15.
 */

"use strict";

var assert = require("chai").assert;
var models = require('../models');
var ValidationJourney = require('../objects/validation_journey');
var async = require('async');
var q = require('q');

var loadData = function (fix) {
    var deferred = q.defer();
    models[fix.model].create(fix.data)
        .complete(function (err, result) {
            if (err) {
                console.log(err);
            }
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
                async.waterfall([
                    function(callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/validationJourneys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    }
                ], function (err, result) {
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

    it('Validate a journey', function (done) {
        var val = new ValidationJourney(),
            validationObj = {
                joinId: 4,
                userId: 2,
                comment_driver: "Revoir la musique !",
                comment_service: "Service au top comme à chaque fois",
                rate_driver: 4,
                rate_service: 5
            };
        val.set(validationObj);
        var tmp = val.get();
        assert.equal(tmp.rate_driver, 4);
        assert.equal(tmp.rate_service, 5);
        val.create(function (err, validation) {
            assert.equal(validation.rate_driver, 4);
            assert.equal(validation.rate_service, 5);
            val.getUserFeedback(function (err, feedback) {
                if (err) return done(err);
                assert.equal(feedback.length, 2);
                done();
            });
        });
    });
});