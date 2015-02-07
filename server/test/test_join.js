/**
 * Created by jeremy on 05/02/15.
 */
"use strict";

var assert = require("chai").assert;
var models = require('../models');
var Join = require('../objects/join');
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
                    function (callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/validationJourneys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
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

    it('Get join list', function (done) {
        var join = new Join();
        join.getList(function (err, joinList) {
            assert.isNull(err);
            assert.equal(joinList.length, 4);
            done();
        });
    });

    it('Get join list by Journey', function (done) {
        var join = new Join();
        join.getByJourney(2, function (err, joinList) {
            assert.isNull(err);
            assert.equal(joinList.length, 2);
            join.getByJourney(1, function (err, joinList) {
                assert.isNull(err);
                assert.equal(joinList.length, 1);
                assert.equal(joinList[0].id, 1);
                assert.equal(joinList[0].nb_place_outward, 2);
                assert.equal(joinList[0].nb_place_return, 3);
                assert.equal(joinList[0].status, "pending");
                join.getByJourney(-1, function (err, joinList) {
                    assert.isNotNull(err);
                    done();
                });
            });
        });
    });

    it('Get join list by user', function (done) {
        var join = new Join();
        join.getByUser(2, function (err, joinList) {
            assert.isNull(err);
            assert.equal(joinList.length, 1);
            assert.equal(joinList[0].id, 3);
            assert.equal(joinList[0].nb_place_outward, 1);
            assert.isNull(joinList[0].nb_place_return);
            assert.equal(joinList[0].status, "pending");
            join.getByUser(-1, function (err, joinList) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Get join list by id', function (done) {
        var join = new Join();
        join.getById(4, function (err, joinInfo) {
            assert.isNull(err);
            assert.equal(joinInfo.id, 4);
            assert.equal(joinInfo.nb_place_outward, 1);
            assert.equal(joinInfo.nb_place_return, 1);
            assert.equal(joinInfo.status, "pending");
            join.getById(-1, function (err, joinInfo) {
                assert.isNotNull(err);
                assert.isNull(joinInfo);
                done();
            });
        });
    });

    it('Create a new Join', function (done) {
       var join = new Join(),
           newJoin = {
                "id": 5,
                "nb_place_outward": 3,
                "nb_place_return": 2,
                "status": "pending",
                "journey_id": 3
           },
           user = {
               "id": 1
           };
        join.set(newJoin);
        join.setJourney(newJoin.journey_id);
        join.setUser(user);
        var tmp = join.get();
        assert.equal(tmp.id, 5);
        assert.equal(tmp.nb_place_outward, 3);
        assert.equal(tmp.nb_place_return, 2);
        assert.equal(tmp.status, "pending");
        join.save(tmp, user, function (err, createdJoin) {
            if (err) console.log(err);
            assert.isNotNull(err);
            join.getList(function (err, joinList) {
                assert.isNull(err);
                assert.equal(joinList.length, 5);
                join.getById(5, function (err, joinInfo) {
                    assert.isNull(err);
                    assert.equal(joinInfo.id, 5);
                    assert.equal(joinInfo.nb_place_outward, 3);
                    assert.equal(joinInfo.nb_place_return, 2);
                    assert.equal(joinInfo.status, "pending");
                    done();
                });
            });
        });
    });
});