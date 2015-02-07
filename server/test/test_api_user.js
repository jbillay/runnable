/**
 * Created by jeremy on 07/02/15.
 */

var request = require('supertest'),
    models = require('../models'),
    assert = require("chai").assert,
    app = require('../../server.js'),
    async = require('async'),
    q = require('q');

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


describe('Test of user API', function () {

    // Recreate the database after each test to ensure isolation
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
                        var fixtures = require('./fixtures/discussions.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/participates.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
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
        console.log("Test API user over !");
    });

    describe('GET /api/user/public/info/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/user/public/info/1')
                .expect(200, done);
        });
        it('should return public info on user 1', function (done) {
            request(app)
                .get('/api/user/public/info/1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.firstname, "Jeremy");
                    assert.equal(res.body.lastname, "Billay");
                    assert.equal(res.body.address, "Saint Germain en laye");
                    assert.equal(res.body.email, "jbillay@gmail.com");
                    assert.equal(res.body.isActive, 1);
                    assert.equal(res.body.role, "admin");
                    done();
                });
        });
    });

    describe('GET /api/user/public/driver/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/user/public/driver/2')
                .expect(200, done);
        });
        it('should return public driver info on user 2', function (done) {
            request(app)
                .get('/api/user/public/driver/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    console.log(res.body);
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0].rate_driver, 3);
                    assert.equal(res.body[0].rate_service, 5);
                    assert.equal(res.body[0].UserId, 1);
                    done();
                });
        });
    });
});
