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
            partnerId = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNjcsImV4cCI6MTIwNTA5NDE5NzR9.fikQ6L2eYUBujEeV-OYMFfX_pER5eC2Z_nQJ0YVyb9w';

        run.save(newRunData, null, partnerId, function (err, newRun) {
            if (err) return done(err);
            assert.equal(newRun.name, 'Trail du partner');
            assert.equal(newRun.slug, 'trail-du-partner');
            assert.equal(newRun.type, 'ultra');
            assert.equal(newRun.address_start, 'Sarcelles, France');
            assert.equal(newRun.UserId, 2);
            return done();
        });
    });

    describe('Test get owner on a run trip', function () {
        it('Should take user info to select user', function (done) {
            var run = new Run(),
                user = { id: 1 };

            run.getOwner(user, null)
                .then(function (userInfo) {
                    assert.equal(userInfo.user.email, 'jbillay@gmail.com');
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
        it('Should take user info even if partner is defined', function (done) {
            var run = new Run(),
                user = { id: 2 },
                partner = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwODgsImV4cCI6MTIwNTA5MjA1MTh9.w17cboqKDtjpsJzeu21C5OEwiei1_Ay2d_BO58mpFcs';

            run.getOwner(user, partner)
                .then(function (userInfo) {
                    assert.equal(userInfo.user.email, 'richard.couret@free.fr');
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
        it('Should take partner info to select user', function (done) {
            var run = new Run(),
                partner = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwODgsImV4cCI6MTIwNTA5MjA1MTh9.w17cboqKDtjpsJzeu21C5OEwiei1_Ay2d_BO58mpFcs';

            run.getOwner(null, partner)
                .then(function (userInfo) {
                    assert.equal(userInfo.user.email, 'jbillay@gmail.com');
                    assert.equal(userInfo.partner.token, partner);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Should failed to found the partner info', function (done) {
            var run = new Run(),
                partner = 'eyJ0eXAiOiJKV1QiLCJhbGc';

            run.getOwner(null, partner)
                .then(function (userInfo) {
                    return done('Error');
                })
                .catch(function (err) {
                    assert.include(err, 'Problem with user of partnership');
                    return done();
                });
        });

        it('Should failed if nothing is sent', function (done) {
            var run = new Run();

            run.getOwner(null, null)
                .then(function (userInfo) {
                    return done('Error');
                })
                .catch(function (err) {
                    assert.equal(err, 'User or partner not found');
                    return done();
                });
        });
    });
});