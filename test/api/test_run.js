/**
 * Created by jeremy on 03/02/15.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Run = require('../../server/objects/run');
var request = require('request');
var sinon = require('sinon');
var _ = require('lodash');
var distance = require('google-distance');
var settings = require('../../conf/config');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Tests of run objects', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        var fakeTime = new Date(2015, 6, 6, 0, 0, 0, 0).getTime();
        sinon.clock = sinon.useFakeTimers(fakeTime, 'Date');
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });

    afterEach(function() {
        // runs after each test in this block
        sinon.clock.restore();
    });

    //After all the tests have run, output all the sequelize logging.
    after(function (done) {
        console.log('Test run over !');
		return done();
    });

    describe('Tests with local database', function () {
        it('Should be able to show active runs', function (done) {
            var run = new Run();
            run.getActiveList(function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 3);
                return done();
            });

        });

        it('Should be able to get Maxicross run', function (done) {
            var run = new Run();
            run.getById(1, function (err, run) {
                if (err) return done(err);
                assert.equal(run.name, 'Maxicross');
                assert.equal(run.slug, 'maxicross');
                assert.equal(run.type, 'trail');
                assert.equal(run.address_start, 'Bouffémont, France');
                assert.equal(run.sticker, 'http://res.cloudinary.com/myruntrip/image/upload/v1453786210/Run_1_Picture_1_test');
                assert.equal(run.pictures.length, 1);
                assert.equal(run.pictures[0], 'http://res.cloudinary.com/myruntrip/image/upload/v1453786210/Run_1_Picture_2_test');
                return done();
            });
        });

        it('Should be able to get all runs', function (done) {
            var run = new Run();
            run.getList(0, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 4);
                return done();
            });
        });

        it('Should be able to get all runs with old one included', function (done) {
            var run = new Run();
            run.getList(1, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 6);
                return done();
            });
        });

        it('Should be able to remove past runs from the global list', function (done) {
            var run = new Run(),
                actualRun = [];
            run.getList(1, function (err, runs) {
                if (err) return done(err);
                runs.forEach(function (currentRun) {
                    if (!run.isPast(currentRun)) {
                        actualRun.push(currentRun);
                    }
                });
                assert.equal(actualRun.length, 4);
                return done();
            });
        });

        it('Should be able to limited number of runs', function (done) {
            var run = new Run();
            run.getNextList(2, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 2);
                return done();
            });
        });
        it('Should be able to search Maxicross race', function (done) {
            var run = new Run(),
                searchInfo = {
                    run_adv_type: 'trail',
                    run_adv_start_date: '2015-02-01 00:00:00',
                    run_adv_end_date: '2015-02-10 00:00:00',
                    run_adv_city: '',
                    run_name: 'maxi'
                };
            run.search(searchInfo, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 1);
                assert.equal(runs[0].name, 'Maxicross');
                assert.equal(runs[0].slug, 'maxicross');
                assert.equal(runs[0].type, 'trail');
                assert.equal(runs[0].address_start, 'Bouffémont, France');
                return done();
            });
        });
        it('Should be able to find race between feb and june 2015', function (done) {
            var run = new Run(),
                searchInfo = {
                    run_adv_type: '',
                    run_adv_start_date: '2015-02-01 00:00:00',
                    run_adv_end_date: '2015-06-30 00:00:00',
                    run_adv_city: '',
                    run_adv_distance: '',
                    run_name: ''
                };
            run.search(searchInfo, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 2);
                return done();
            });
        });
        it('Should be able to find the race after today', function (done) {
            var run = new Run(),
                searchInfo = {
                    run_adv_type: '',
                    run_adv_start_date: '2015-12-01 00:00:00',
                    run_adv_end_date: '',
                    run_adv_city: '',
                    run_adv_distance: '',
                    run_name: ''
                };
            run.search(searchInfo, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 1);
                return done();
            });
        });

        it('Should be able to find trails', function (done) {
            var run = new Run(),
                searchInfo = {
                    run_adv_type: 'trail',
                    run_adv_start_date: '',
                    run_adv_end_date: '',
                    run_adv_city: '',
                    run_name: ''
                };
            run.search(searchInfo, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 1);
                return done();
            });
        });

        it('Should be able to find Les templiers race', function (done) {
            var run = new Run(),
                searchInfo = {
                    run_adv_type: '',
                    run_adv_start_date: '',
                    run_adv_end_date: '',
                    run_adv_city: '',
                    run_name: 'TemPl'
                };
            run.search(searchInfo, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 1);
                assert.equal(runs[0].name, 'Les templiers');
                assert.equal(runs[0].slug, 'les-templiers');
                assert.equal(runs[0].type, 'trail');
                assert.equal(runs[0].address_start, 'Millau, France');
                return done();
            });
        });

        it('Should be able to activate the run', function (done) {
            var run = new Run();
            run.toggleActive(6, function (err) {
                if (err) return done(err);
                run.getActiveList(function (err, runs) {
                    if (err) return done(err);
                    assert.equal(runs.length, 4);
                    return done();
                });
            });
        });

        it('Should be able to deactivate the run', function (done) {
            var run = new Run();
            run.toggleActive(2, function (err) {
                if (err) return done(err);
                run.getActiveList(function (err, runs) {
                    if (err) return done(err);
                    assert.equal(runs.length, 2);
                    return done();
                });
            });
        });

        it('Should be able to create a run', function (done) {
            this.timeout(15000);
            var run = new Run(),
                data_run = {
                    id: 7,
                    name: 'Marathon du Mont Blanc',
                    type: 'marathon',
                    address_start: 'Chamonix, France',
                    date_start: '2016-07-28 00:00:00',
                    time_start: '06:20',
                    distances: '80km - 42km - 23km - 10km - 3.8km',
                    elevations: '3214+',
                    info: 'dkqsd lqldsj lqkjdsllq ksjdlq',
                    is_active: 1
                },
                data_user = {
                    id: 1
                };
            run.set({}, {}, null);
            run.set(data_run, data_user, null);
            var tmp = run.get();
            assert.equal(tmp.name, 'Marathon du Mont Blanc');
            assert.equal(tmp.type, 'marathon');
            assert.equal(tmp.address_start, 'Chamonix, France');
            run.save(tmp, data_user, null, function (err, newRun) {
                if (err) return done(err);
                assert.equal(newRun.name, 'Marathon du Mont Blanc');
                assert.equal(newRun.slug, 'marathon-du-mont-blanc');
                assert.equal(newRun.type, 'marathon');
                assert.equal(newRun.address_start, 'Chamonix, France');
                run.getActiveList(function (err, runs) {
                    if (err) return done(err);
                    assert.equal(runs.length, 4);
                    return done();
                });
            });
        });

        it('Should be able to find race within less then 30km', function (done) {
            var obj = [
                {index:null, distance:'642 km',  distanceValue:642143,  duration:'5 hours 44 mins', durationValue:20636,    origin:'Millau, France',                destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'642 km',  distanceValue:642143,  duration:'5 hours 44 mins', durationValue:20636,    origin:'Millau, France',                destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'642 km',  distanceValue:642143,  duration:'5 hours 44 mins', durationValue:20636,    origin:'Millau, France',                destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'22.5 km', distanceValue:22523,   duration:'36 mins',         durationValue:2142,     origin:'Saint-Germain-en-Laye, France', destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'22.5 km', distanceValue:22523,   duration:'36 mins',         durationValue:2142,     origin:'Saint-Germain-en-Laye, France', destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'22.5 km', distanceValue:22523,   duration:'36 mins',         durationValue:2142,     origin:'Saint-Germain-en-Laye, France', destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'594 km',  distanceValue:587210,  duration:'5 hours 23 mins', durationValue:19362,    origin:'Saint-Émilion, France',         destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'594 km',  distanceValue:587210,  duration:'5 hours 23 mins', durationValue:19362,    origin:'Saint-Émilion, France',         destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
                {index:null, distance:'594 km',  distanceValue:587210,  duration:'5 hours 23 mins', durationValue:19362,    origin:'Saint-Émilion, France',         destination:'Paris, France',    mode:'driving', units:'metric', language:'en', avoid:null, sensor:false},
            ];

            sinon.stub(distance, 'get')
                .yields(null, obj);
            var run = new Run(),
                searchInfo = {
                    run_adv_type: '',
                    run_adv_start_date: '',
                    run_adv_end_date: '',
                    run_adv_city: 'Saint-Germain-en-Laye, France',
                    run_adv_distance: '30',
                    run_name: ''
                };
            run.search(searchInfo, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 1);
                distance.get.restore();
                return done();
            });
        });

        it('Should get sticker for a list of race', function (done) {
            var run = new Run();

            run.getList(1, function (err, runs) {
                if (err) return done(err);
                assert.equal(runs.length, 6);
                assert.equal(
                    _.find(runs, _.matchesProperty('id', 1)).sticker,
                    'http://res.cloudinary.com/myruntrip/image/upload/v1453786210/Run_1_Picture_1_test'
                );
                assert.equal(
                    _.find(runs, _.matchesProperty('id', 2)).sticker,
                    'http://res.cloudinary.com/myruntrip/image/upload/v1453786210/Run_2_Picture_3_test'
                );
                return done();
            });
        });

        it('Should create a run for a partner', function (done) {
            this.timeout(15000);
            var run = new Run(),
                newRunData = {
                    id: 7,
                    name: 'Trail du partner',
                    type: 'ultra',
                    address_start: 'Sarcelles, France',
                    date_start: '2016-09-30 00:00:00',
                    time_start: '09:50',
                    distances: '180km',
                    elevations: '3+',
                    info: 'http://www.marathondupartner.fr',
                    is_active: 1
                },
                user = {
                    id: 1
                },
                partner = {
                    id: 3
                };

            run.save(newRunData, user, partner, function (err, newRun) {
                if (err) return done(err);
                assert.equal(newRun.name, 'Trail du partner');
                assert.equal(newRun.slug, 'trail-du-partner');
                assert.equal(newRun.type, 'ultra');
                assert.equal(newRun.address_start, 'Sarcelles, France');
                assert.equal(newRun.UserId, 1);
                return done();
            });
        });
        describe('Test checkRunObject', function () {
            it('Should return error as name is empty', function (done) {
                var runToCheck = {
                    name: [],
                    type: 'trail',
                    address_start: 'Chnatilly, France',
                    date_start: '2018-09-01'
                };
                var run = new Run();

                var res = run.checkRunObject(runToCheck);

                assert.equal(res.type, 'error');
                assert.equal(res.msg, 'Run name is a mandatory field');
                return done();
            });
            it('Should return error as type is empty', function (done) {
                var runToCheck = {
                    name: 'tOTO',
                    type: [],
                    address_start: 'Chnatilly, France',
                    date_start: '2018-09-01'
                };
                var run = new Run();

                var res = run.checkRunObject(runToCheck);

                assert.equal(res.type, 'error');
                assert.equal(res.msg, 'Run type is a mandatory field');
                return done();
            });
            it('Should return error as address_start is empty', function (done) {
                var runToCheck = {
                    name: 'tOTO',
                    type: 'trail',
                    address_start: [],
                    date_start: '2018-09-01'
                };
                var run = new Run();

                var res = run.checkRunObject(runToCheck);

                assert.equal(res.type, 'error');
                assert.equal(res.msg, 'Run address start point (address_start) is a mandatory field');
                return done();
            });
            it('Should return error as date_start is empty', function (done) {
                var runToCheck = {
                    name: 'tOTO',
                    type: 'trail',
                    address_start: 'Chantilly, France',
                    date_start: []
                };
                var run = new Run();

                var res = run.checkRunObject(runToCheck);

                assert.equal(res.type, 'error');
                assert.equal(res.msg, 'Run start date (date_start) is a mandatory field');
                return done();
            });
        });
    });
    describe('Tests with mock', function () {
        describe('Test getList', function () {
            it('Should get list of runs which fail to find runs', function (done) {
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.getList(1, function (err, run) {
                    if (err) {
                        assert.equal(err.toString(), 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
            it('Should get list of runs which fail to get run sticker', function (done) {
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; } },
                                    Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.getList(1, function (err, run) {
                    if (err) {
                        assert.equal(err.toString(), 'Error: Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
        });
        describe('Test toggleActive', function () {
            it('Should toggle active status of a run which fail to find run', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.toggleActive(1, function (err, run) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not toggle active on run !');
                    }
                });
            });
            it('Should toggle active status of a run which fail to save run', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    id: 1,
                    is_active: true,
                    save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.toggleActive(1, function (err, run) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not toggle active on run !');
                    }
                });
            });
        });
        describe('Test getById', function () {
            it('Should get a run which fail to get run info', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } },
                    Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.getById(1, function (err, run) {
                    if (err) {
                        assert.equal(err.toString(), 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
            it('Should get a run which fail to get pictures', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.getById(1, function (err, run) {
                    if (err) {
                        assert.equal(err.toString(), 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
        });
        describe('Test getNextList', function () {
            it('Should get next runs which fail to get run info', function (done) {
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.getNextList(4, function (err, run) {
                    if (err) {
                        assert.equal(err.toString(), 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
        });
        describe('Test getActiveList', function () {
            it('Should get active run list which fail to get run info', function (done) {
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.getActiveList(function (err, run) {
                    if (err) {
                        assert.equal(err.toString(), 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
            it('Should get active run list which fail to get sticker', function (done) {
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; } },
                                    Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }};
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.getActiveList(function (err, run) {
                    if (err) {
                        assert.equal(err.toString(), 'Error: Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
        });
        describe('Test save', function () {
            it('Should save a run which fail to find user', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } },
                    Run: { findOrCreate: function (params) { var deferred = q.defer(); deferred.resolve([{
                        setUser: function (params) { var deferred = q.defer(); deferred.resolve(true); return deferred.promise; },
                        setPartner:  function (params) { var deferred = q.defer(); deferred.resolve(true); return deferred.promise; },
                        save: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, name: 'mock'}); return deferred.promise; }
                    }]); return deferred.promise; } }};
                var stubUtil = function util() {};
                stubUtil.prototype.geocode = function (address) { var deferred = q.defer(); deferred.resolve({lng: 1, lat: 2}); return deferred.promise; };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel, './utils': stubUtil});
                var run = new Run();
                run.save({id: 1, name: 'mock', address_start: 'Chantilly'}, {id: 5}, {id: 3}, function (err, run) {
                    if (err) {
                        assert.equal(err, 'Not authorized');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
            it('Should save a run which fail to create run', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2}); return deferred.promise; } },
                    Run: { findOrCreate: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }};
                var stubUtil = function util() {};
                stubUtil.prototype.geocode = function (address) { var deferred = q.defer(); deferred.reject('Mock to skip'); return deferred.promise; };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel, './utils': stubUtil});
                var run = new Run();
                run.save({id: 1, name: 'mock', address_start: 'Chantilly'}, {id: 5}, {id: 3}, function (err, run) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
        });
        describe('Test search', function () {
            it('Should search a run which fail to find runs', function (done) {
                var searchInfo = {
                    run_adv_type: 'trail',
                    run_adv_start_date: '2015-02-01 00:00:00',
                    run_adv_end_date: '2015-02-10 00:00:00',
                    run_adv_city: '',
                    run_name: 'maxi'
                };
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.search(searchInfo, function (err, run) {
                    if (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
            it('Should search a run which fail to get sticker', function (done) {
                var searchInfo = {
                    run_adv_type: 'trail',
                    run_adv_start_date: '2015-02-01 00:00:00',
                    run_adv_end_date: '2015-02-10 00:00:00',
                    run_adv_city: '',
                    run_name: 'maxi'
                };
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 2}, {id: 7}]); return deferred.promise; } },
                                    Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }};
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel});
                var run = new Run();
                run.search(searchInfo, function (err, run) {
                    if (err) {
                        assert.equal(err, 'Error: Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
            it('Should search a run which fail to get distance', function (done) {
                var searchInfo = {
                    run_adv_type: 'trail',
                    run_adv_start_date: '2015-02-01 00:00:00',
                    run_adv_end_date: '2015-02-10 00:00:00',
                    run_adv_city: 'Chantilly',
                    run_name: 'maxi',
                    run_adv_distance: 10
                };
                var stubModel = { Run: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 2}, {id: 7}]); return deferred.promise; } },
                                    Picture: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 2, RunId: 3}, {id: 7, RunId: 3}]); return deferred.promise; } }};
                var stubDistance = { get: function (options, callback) { console.error('Ici'); return callback('Mock to fail', null);} };
                var Run = proxyquire('../../server/objects/run', {'../models': stubModel, 'google-distance': stubDistance});
                var run = new Run();
                run.search(searchInfo, function (err, run) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not get list of runs !');
                    }
                });
            });
        });
    });
});