/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../models');
var Join = require('../objects/join');
var Invoice = require('../objects/invoice');
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

describe('Test of join object', function () {
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
                        var fixtures = require('./fixtures/invoices.json');
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
                    return done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of join over !');
    });

    it('Get join list', function (done) {
        var join = new Join();
        join.getList(function (err, joinList) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinList.length, 4);
            return done();
        });
    });

    it('Get join list by Journey', function (done) {
        var join = new Join();
        join.getByJourney(2, function (err, joinList) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinList.length, 2);
            join.getByJourney(3, function (err, joinList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinList.length, 0);
                join.getByJourney(1, function (err, joinList) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(joinList.length, 1);
                    assert.equal(joinList[0].id, 1);
                    assert.equal(joinList[0].nb_place_outward, 2);
                    assert.equal(joinList[0].nb_place_return, 2);
                    join.getByJourney(-1, function (err, joinList) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });
    });

    it('Get join list by user', function (done) {
        var join = new Join();
        join.getByUser(1, function (err, joinList) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinList.length, 2);
            join.getByUser(2, function (err, joinList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinList.length, 1);
                assert.equal(joinList[0].id, 3);
                assert.equal(joinList[0].nb_place_outward, 1);
                assert.isNull(joinList[0].nb_place_return);
                join.getByUser(-1, function (err, joinList) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });
    });

    it('Get join list by id', function (done) {
        var join = new Join();
        join.getById(4, function (err, joinInfo) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinInfo.id, 4);
            assert.equal(joinInfo.nb_place_outward, 1);
            assert.equal(joinInfo.nb_place_return, 1);
            join.getById(-1, function (err, joinInfo) {
                assert.isNotNull(err);
                assert.isNull(joinInfo);
                return done();
            });
        });
    });

    it('Create a new Join', function (done) {
       var join = new Join(),
           newJoin = {
                id: 5,
                nb_place_outward: 3,
                nb_place_return: 2,
                journey_id: 3
           },
           user = {
               'id': 1
           };
        join.set(newJoin);
        join.setJourney(newJoin.journey_id);
        join.setUser(user);
        var tmp = join.get();
        assert.equal(tmp.id, 5);
        assert.equal(tmp.nb_place_outward, 3);
        assert.equal(tmp.nb_place_return, 2);
        join.save(tmp, user, function (err, createdJoin) {
            if (err) console.log(err);
            assert.isNull(err);
            join.getList(function (err, joinList) {
                assert.isNull(err);
                assert.equal(joinList.length, 5);
                join.getById(5, function (err, joinInfo) {
                    assert.isNull(err);
                    assert.equal(joinInfo.id, 5);
                    assert.equal(joinInfo.nb_place_outward, 3);
                    assert.equal(joinInfo.nb_place_return, 2);
                    return done();
                });
            });
        });
    });

    it('Cancel join by id', function (done) {
        var join = new Join(),
            invoice = new Invoice();
        join.cancelById(2)
            .then(function (joinInfo) {
                invoice.getById(2, function (err, invoiceInfo) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(invoiceInfo.status, 'cancelled');
                    return done();
                });
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Cancel not existing join', function (done) {
        var join = new Join();
        join.cancelById(42)
            .then(function (joinInfo) {
                return done(new Error('Should be an error'));
            })
            .catch(function (err) {
                assert.isNotNull(err);
                return done();
            });
    });
});