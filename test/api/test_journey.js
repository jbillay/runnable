/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Journey = require('../../server/objects/journey');
var Join = require('../../server/objects/join');
var async = require('async');
var sinon = require('sinon');
var settings = require('../../conf/config');
var q = require('q');

var loadData = function (fix) {
    var deferred = q.defer();
    models[fix.model].create(fix.data)
        .complete(function (err, result) {
            if (err) {
                return deferred.reject('error ' + err);
            }
            return deferred.resolve(result);
        });
    return deferred.promise;
};

describe('Test of journey object', function () {
    beforeEach(function (done) {
        var fakeTime = new Date(2015, 6, 6, 0, 0, 0, 0).getTime();
        sinon.clock = sinon.useFakeTimers(fakeTime, 'Date');
        this.timeout(settings.timeout);
        models.sequelize.sync({force: true})
            .then(function () {
                async.series([
                    function fn1(callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function fn2(callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function fn3(callback) {
                        var fixtures = require('./fixtures/options.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function fn4(callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function fn5(callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function fn6(callback) {
                        var fixtures = require('./fixtures/invoices.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function fn7(callback) {
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

    afterEach(function() {
        // runs after each test in this block
        sinon.clock.restore();
    });

    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of user over !');
    });

    it('Get user journeys list', function (done) {
        var journey = new Journey();
        journey.getByUser(1, function (err, journeyList) {
            if (err) return done(err);
            assert.equal(journeyList.length, 3);
            assert.equal(journeyList[1].id, 2);
            assert.equal(journeyList[1].address_start, 'Nantes, France');
            assert.equal(journeyList[1].car_type, 'citadine');
            assert.equal(journeyList[1].amount, 32);
            assert.equal(journeyList[1].User.email, 'jbillay@gmail.com');
            assert.equal(journeyList[1].Run.name, 'Les templiers');
            journey.getByUser(-1, function (err, journeyList) {
                assert.isNotNull(err);
                return done();
            });
        });
    });

    it('Get filtered Journey already full with and without limit', function (done) {
        var journey = new Journey();
        models.Journey.findAll({where: {is_canceled: false}, include: [
                {
                    model: models.Join,
                    as: 'Joins',
                    include: [ models.Invoice ]
                },
                { model: models.Run }
            ]})
            .then(function (journeyList) {
                var filteredJourney = journey.filterFullJourney(journeyList, 0);
                assert.equal(filteredJourney.length, 2);
                filteredJourney = journey.filterFullJourney(journeyList, 1);
                assert.equal(filteredJourney.length, 1);
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Get filtered past Journey', function (done) {
        var journey = new Journey();
        models.Journey.findAll({where: {is_canceled: false}, include: [
                {
                    model: models.Join,
                    as: 'Joins',
                    include: [ models.Invoice ]
                },
                { model: models.Run }
            ]})
            .then(function (journeyList) {
                var filteredJourney = journey.filterPastJourney(journeyList);
                assert.equal(filteredJourney.length, 3);
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Get free space for a journey', function (done) {
        var journey = new Journey();
        journey.getBookSpace(1, function (err, spaces) {
            if (err) return done(err);
            assert.equal(spaces.outward, 2);
            assert.equal(spaces.return, 2);
            journey.getBookSpace(2, function (err, spaces) {
                if (err) return done(err);
                assert.equal(spaces.outward, 2);
                assert.equal(spaces.return, 0);
                journey.getBookSpace(3, function (err, spaces) {
                    if (err) return done(err);
                    assert.equal(spaces.outward, 0);
                    assert.equal(spaces.return, 0);
                    return done();
                });
            });
        });
    });

    it('Get journey info', function (done) {
        var journey = new Journey();
        journey.getById(3, function (err, journeyInfo) {
            if (err) return done(err);
            assert.equal(journeyInfo.id, 3);
            assert.equal(journeyInfo.address_start, 'Rouen');
            assert.equal(journeyInfo.car_type, 'citadine');
            assert.equal(journeyInfo.amount, 12);
            assert.equal(journeyInfo.distance, '250 km');
            assert.equal(journeyInfo.duration, '2 heures 45 minutes');
            assert.equal(journeyInfo.journey_type, 'aller-retour');
            assert.equal(journeyInfo.time_start_outward, '09:00');
            assert.equal(journeyInfo.nb_space_outward, 2);
            assert.equal(journeyInfo.time_start_return, '09:00');
            assert.equal(journeyInfo.nb_space_return, 2);
            assert.equal(journeyInfo.RunId, 4);
            journey.getById(-1, function (err, journeyInfo) {
                assert.isNotNull(err);
                return done();
            });
        });
    });

    it('Get next journeys list', function (done) {
        var journey = new Journey();
        journey.getNextList(3, function (err, journeyList) {
            if (err) return done(err);
            assert.equal(journeyList.length, 2);
            journey.getNextList(2, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 2);
                journey.getNextList('dmkme', function (err, journeyList) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });
    });

    it('Get list of journey for a run', function (done) {
        var journey = new Journey();
        journey.getListForRun(4, function (err, journeyList) {
            if (err) return done(err);
            assert.equal(journeyList.length, 1);
            journey.getListForRun(2, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 0);
                journey.getListForRun('dmkme', function (err, journeyList) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });
    });

    it('Get list of journey', function (done) {
        var journey = new Journey();
        journey.getList(0, function (err, journeyList) {
            if (err) return done(err);
            assert.equal(journeyList.length, 4);
            return done();
        });
    });

    it('Get list of journey with old one', function (done) {
        var journey = new Journey();
        journey.getList(1, function (err, journeyList) {
            if (err) return done(err);
            assert.equal(journeyList.length, 5);
            return done();
        });
    });

    it('Get list of open journey', function (done) {
        var journey = new Journey();
        journey.getOpenList(function (err, journeyList) {
            if (err) return done(err);
            assert.equal(journeyList.length, 2);
            return done();
        });
    });

    it('Create a new journey', function (done) {
        var journey = new Journey(),
            newJourney = {
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2016-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2016-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                UserId: 1,
                Run: {
                    id: 4
                }
            },
            user = {
                'id': 1
            };
        journey.setJourney(newJourney);
        var tmp = journey.get();
        assert.equal(tmp.distance, '25 km');
        assert.equal(tmp.journey_type, 'aller-retour');
        assert.equal(tmp.car_type, 'citadine');
        assert.equal(tmp.amount, 5);
        journey.save(tmp, user, function(err, newJourney) {
            if (err) return done(err);
            assert.equal(newJourney.id, 6);
            assert.equal(newJourney.distance, '25 km');
            assert.equal(newJourney.journey_type, 'aller-retour');
            assert.equal(newJourney.car_type, 'citadine');
            assert.equal(newJourney.amount, 5);
            journey.getList(1, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 6);
                return done();
            });
        });
    });

    it('Toggle payed status', function (done) {
        var journey = new Journey();
        journey.togglePayed(1, function (err, retJourney) {
            if (err) return done(err);
            assert.equal(retJourney.is_payed, true);
            journey.togglePayed(1, function (err, retJourney) {
                if (err) return done(err);
                assert.equal(retJourney.is_payed, false);
                return done();
            });
        });
    });

    it('Cancel a journey', function (done) {
        var journey = new Journey(),
            join = new Join();
        journey.getById(1, function (err, journeyInfo) {
            if (err) return done(err);
            assert.equal(journeyInfo.is_canceled, false);
            journey.cancel(1, function (err, journeyUpdated) {
                if (err) return done(err);
                assert.equal(journeyUpdated.is_canceled, true);
                journey.getByUser(1, function (err, journeyList) {
                    if (err) return done(err);
                    assert.equal(journeyList.length, 2);
                    join.getByJourney(1, function (err, joinList) {
                        if (err) return done(err);
                        assert.equal(joinList.length, 0);
                        return done();
                    });
                });
            });
        });
    });

    it('Update an existing journey', function (done) {
        var journey = new Journey(),
            updateJourney = {
                id: 2,
                address_start: 'Paris, France',
                distance: '654 km',
                duration: '5 heures 14 minute',
                journey_type: 'aller-retour',
                date_start_outward: '2015-05-02 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 1,
                date_start_return: '2015-06-02 00:00:00',
                time_start_return: '03:00',
                nb_space_return: 5,
                car_type: 'break',
                amount: 56,
                updatedAt: '2014-12-22 13:41:38',
                UserId: 2,
                Run: {
                    id: 3
                }
            };
        journey.setJourney(updateJourney);
        var tmp = journey.get();
        assert.equal(tmp.distance, '654 km');
        assert.equal(tmp.journey_type, 'aller-retour');
        assert.equal(tmp.car_type, 'break');
        assert.equal(tmp.amount, 56);
        journey.getById(2, function (err, selectJourney) {
            if (err) return done(err);
            assert.equal(selectJourney.distance, '754 km');
            assert.equal(selectJourney.journey_type, 'aller');
            assert.equal(selectJourney.car_type, 'citadine');
            assert.equal(selectJourney.amount, 32);
            assert.equal(selectJourney.RunId, 2);
            assert.equal(selectJourney.UserId, 1);
            journey.save(tmp, 2, function(err, updatedJourney) {
                if (err) return done(err);
                assert.equal(updatedJourney.id, 2);
                assert.equal(updatedJourney.distance, '654 km');
                assert.equal(updatedJourney.journey_type, 'aller-retour');
                assert.equal(updatedJourney.car_type, 'break');
                assert.equal(updatedJourney.amount, 56);
                assert.equal(updatedJourney.RunId, 3);
                assert.equal(updatedJourney.UserId, 2);
                journey.getById(2, function (err, selectedJourney) {
                    if (err) return done(err);
                    assert.equal(selectedJourney.distance, '654 km');
                    assert.equal(selectedJourney.journey_type, 'aller-retour');
                    assert.equal(selectedJourney.car_type, 'break');
                    assert.equal(selectedJourney.amount, 56);
                    assert.equal(selectedJourney.RunId, 3);
                    assert.equal(selectedJourney.UserId, 2);
                    return done();
                });
            });
        });
    });
});