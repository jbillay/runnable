/**
 * Created by jeremy on 03/02/15.
 */

'use strict';

var assert = require('chai').assert;
var models = require('../models');
var Run = require('../objects/run');
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
                    done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test run over !');
    });

    it('Should be able to show active runs', function (done) {
        var run = new Run();
        run.getActiveList(function (err, runs) {
            if (err) {
                console.log('Error: ' + err);
            }
            assert.equal(runs.length, 5);
            done();
        });
    });

    it('Should be able to get Maxicross run', function (done) {
        var run = new Run();
        run.getById(1, function (err, run) {
            if (err) {
                console.log('Error: ' + err);
            }
            assert.equal(run.name, 'Maxicross');
            assert.equal(run.type, 'trail');
            assert.equal(run.address_start, 'Bouffémont, France');
            done();
        });
    });

    it('Should be able to get all runs', function (done) {
        var run = new Run();
        run.getList(function (err, runs) {
            if (err) {
                console.log('Error: ' + err);
            }
            assert.equal(runs.length, 6);
            done();
        });
    });

    it('Should be able to limited number of runs', function (done) {
        var run = new Run();
        run.getNextList(2, function (err, runs) {
            if (err) {
                console.log('Error: ' + err);
            }
            assert.equal(runs.length, 2);
            done();
        });
    });

    it('Should be able to search for runs', function (done) {
        var run = new Run(),
            searchInfo = {
                run_adv_type: 'trail',
                run_adv_start_date: '',
                run_adv_end_date: '',
                run_adv_city: 'Bouffémont',
                run_name: ''
            };
        run.search(searchInfo, function (err, runs) {
            if (err) {
                console.log('Error: ' + err);
                return done(err);
            }
            assert.equal(runs.length, 1);
            return done();
        });
    });

    it('Should be able to activate the run', function (done) {
        var run = new Run();
        run.toggleActive(6, function (err) {
            if (err) {
                console.log('Error: ' + err);
            }
            run.getActiveList(function (err, runs) {
                assert.equal(runs.length, 6);
                done();
            });
        });
    });

    it('Should be able to deactivate the run', function (done) {
        var run = new Run();
        run.toggleActive(1, function (err) {
            if (err) {
                console.log('Error: ' + err);
            }
            run.getActiveList(function (err, runs) {
                assert.equal(runs.length, 4);
                done();
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
                date_start: '2015-06-28 00:00:00',
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
        run.save(function (err, newRun) {
            if (err) {
                console.log('Error: ' + err);
            }
            assert.equal(newRun.name, 'Marathon du Mont Blanc');
            assert.equal(newRun.type, 'marathon');
            assert.equal(newRun.address_start, 'Chamonix, France');
            run.getActiveList(function (err, runs) {
                assert.equal(runs.length, 6);
                done();
            });
        });
    });
});