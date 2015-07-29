/**
 * Created by jeremy on 03/02/15.
 */

'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Run = require('../../server/objects/run');
var async = require('async');
var q = require('q');
var request = require('request');
var sinon = require('sinon');
var distance = require('google-distance');
var fakeDate;

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

describe('Tests of run objects', function () {
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
                    }
                ], function (err, result) {
                    return done();
                });
            });
    });

    //After all the tests have run, output all the sequelize logging.
    after(function (done) {
		distance.get.restore();
        console.log('Test run over !');
		return done();
    });

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
            assert.equal(run.type, 'trail');
            assert.equal(run.address_start, 'Bouffémont, France');
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
                run_name: 'templ'
            };
        run.search(searchInfo, function (err, runs) {
            if (err) return done(err);
            assert.equal(runs.length, 1);
            assert.equal(runs[0].name, 'Les templiers');
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
        run.set(data_run, data_user);
        var tmp = run.get();
        assert.equal(tmp.name, 'Marathon du Mont Blanc');
        assert.equal(tmp.type, 'marathon');
        assert.equal(tmp.address_start, 'Chamonix, France');
        run.save(tmp, data_user, function (err, newRun) {
            if (err) return done(err);
            assert.equal(newRun.name, 'Marathon du Mont Blanc');
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
			return done();
		});
    });
});