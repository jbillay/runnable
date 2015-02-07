/**
 * Created by jeremy on 05/02/15.
 */
"use strict";

var assert = require("chai").assert;
var models = require('../models');
var Journey = require('../objects/journey');
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

describe('Test of journey object', function () {
    "use strict";
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
        console.log("Test of user over !");
    });

    it('Get user journeys list', function (done) {
        var journey = new Journey();
        journey.getByUser(2, function (err, journeyList) {
            assert.equal(journeyList.length, 1);
            assert.equal(journeyList[0].id, 3);
            assert.equal(journeyList[0].address_start, "Rouen");
            assert.equal(journeyList[0].car_type, "citadine");
            assert.equal(journeyList[0].amount, 12);
            journey.getByUser(-1, function (err, journeyList) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Get journey info', function (done) {
        var journey = new Journey();
        journey.getById(3, function (err, journeyInfo) {
            if (err) {
                console.log(err);
            }
            assert.equal(journeyInfo.id, 3);
            assert.equal(journeyInfo.address_start, "Rouen");
            assert.equal(journeyInfo.car_type, "citadine");
            assert.equal(journeyInfo.amount, 12);
            assert.equal(journeyInfo.distance, "250 km");
            assert.equal(journeyInfo.duration, "2 heures 45 minutes");
            assert.equal(journeyInfo.journey_type, "aller-retour");
            assert.equal(journeyInfo.date_start_outward, "Fri Dec 12 2014 00:00:00 GMT+0100 (CET)");
            assert.equal(journeyInfo.time_start_outward, "09:00");
            assert.equal(journeyInfo.nb_space_outward, 2);
            assert.equal(journeyInfo.date_start_return, "Sat Dec 13 2014 00:00:00 GMT+0100 (CET)");
            assert.equal(journeyInfo.time_start_return, "09:00");
            assert.equal(journeyInfo.nb_space_return, 2);
            assert.equal(journeyInfo.RunId, 4);
            journey.getById(-1, function (err, journeyInfo) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Get next journeys list', function (done) {
        var journey = new Journey();
        journey.getNextList(2, function (err, journeyList) {
            if (err) console.log(err);
            assert.equal(journeyList.length, 2);
            journey.getNextList('dmkme', function (err, journeyList) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Get list of journey for a run', function (done) {
        var journey = new Journey();
        journey.getListForRun(5, function (err, journeyList) {
            if (err) console.log(err);
            assert.equal(journeyList.length, 1);
            journey.getListForRun('dmkme', function (err, journeyList) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Get list of journey', function (done) {
        var journey = new Journey();
        journey.getList(function (err, journeyList) {
            if (err) console.log(err);
            assert.equal(journeyList.length, 3);
            done();
        });
    });

    it('Create a new journey', function (done) {
        var journey = new Journey(),
            newJourney = {
                "id": 4,
                "address_start": "Paris",
                "distance": "25 km",
                "duration": "20 minutes",
                "journey_type": "aller-retour",
                "date_start_outward": "2014-12-12 00:00:00",
                "time_start_outward": "09:00",
                "nb_space_outward": 2,
                "date_start_return": "2014-12-13 00:00:00",
                "time_start_return": "09:00",
                "nb_space_return": 2,
                "car_type": "citadine",
                "amount": 5,
                "RunId": 4,
                "UserId": 1
            },
            user = {
                "id": 1
            },
            run = 4;
        journey.setJourney(newJourney);
        journey.setRun(run);
        var tmp = journey.get();
        assert.equal(tmp.id, 4);
        assert.equal(tmp.distance, "25 km");
        assert.equal(tmp.journey_type, "aller-retour");
        assert.equal(tmp.car_type, "citadine");
        assert.equal(tmp.amount, 5);
        journey.save(tmp, user, function(err, newJourney) {
            assert.equal(newJourney.id, 4);
            assert.equal(newJourney.distance, "25 km");
            assert.equal(newJourney.journey_type, "aller-retour");
            assert.equal(newJourney.car_type, "citadine");
            assert.equal(newJourney.amount, 5);
            journey.getList(function (err, journeyList) {
                if (err) console.log(err);
                assert.equal(journeyList.length, 4);
                done();
            });
        });
    });
});