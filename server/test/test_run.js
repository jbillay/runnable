/**
 * Created by jeremy on 03/02/15.
 */

'use strict';

var assert = require("chai").assert;
var models = require('../models');
var Run = require('../objects/run');

describe('Tests of run objects', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        models.sequelize.sync({force: true})
            .then(function () {
                var fixtures = require('./fixtures/test_run.json');
                fixtures.forEach(function (fix) {
                    models[fix.model].create(fix.data);
                });
                done();
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log("Test run over !");
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
            assert.equal(run.name, "Maxicross");
            assert.equal(run.type, "trail");
            assert.equal(run.address_start, "Bouffémont, France");
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
    // (18, 'Marathon du Mont Blanc', 'marathon', 'Chamonix, France', '2015-06-28 00:00:00', '06:20', '80km - 42km - 23km - 10km - 3.8km', '3214+', '							', 1, '2014-11-24 08:28:53', '2014-11-24 08:28:53', 1),
    it('Should be able to create a run', function (done) {
        var run = new Run(),
            data_run = {
                "id": 7,
                "name": "Marathon du Mont Blanc",
                "type": "marathon",
                "address_start": "Chamonix, France",
                "date_start": "2015-06-28 00:00:00",
                "time_start": "06:20",
                "distances": "80km - 42km - 23km - 10km - 3.8km",
                "elevations": "3214+",
                "info": "dkqsd lqldsj lqkjdsllq ksjdlq",
                "is_active": 1
            },
            data_user = {
                "id": 1
            };
        run.set(data_run, data_user);
        run.save(function (err, newRun) {
            if (err) {
                console.log('Error: ' + err);
            }
            run.getActiveList(function (err, runs) {
                assert.equal(runs.length, 6);
                done();
            });
        });
    });
});