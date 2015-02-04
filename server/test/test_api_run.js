/**
 * Created by jeremy on 04/02/15.
 */

var request = require('supertest'),
    models = require('../models'),
    assert = require("chai").assert,
    app = require('../../server.js');

describe('Test of run API', function () {

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
        console.log("Test API run over !");
    });

    describe('GET /api/run/list', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/run/list')
                .expect(200, done);
        });
        it('should return list of 5 runs', function (done) {
            request(app)
                .get('/api/run/list')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 5);
                    done();
                });
        });
    });

    describe('GET /api/run/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/run/1')
                .expect(200, done);
        });
        it('should return Maxicross run', function (done) {
            request(app)
                .get('/api/run/1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.res.body.name, "Maxicross");
                    assert.equal(res.res.body.type, "trail");
                    assert.equal(res.res.body.address_start, "Bouffémont, France");
                    assert.equal(res.res.body.time_start, "09:15");
                    assert.equal(res.res.body.distances, "15k - 30k - 7k");
                    assert.equal(res.res.body.elevations, "500+ - 1400+");
                    assert.equal(res.res.body.info, "Toutes les infos sur le maxicross");
                    assert.equal(res.res.body.is_active, 1);
                    done();
                });
        });
    });

    describe('GET /api/run/next/:nb', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/run/next/2')
                .expect(200, done);
        });
        it('should return list of 2 runs', function (done) {
            request(app)
                .get('/api/run/next/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    done();
                });
        });
    });
});
