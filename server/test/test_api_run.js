/**
 * Created by jeremy on 04/02/15.
 */

var request = require('supertest'),
    models = require('../models'),
    assert = require("chai").assert,
    app = require('../../server.js'),
    async = require('async'),
    q = require('q'),
    superagent = require('superagent');


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


describe('Test of run API', function () {

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

    describe('GET /api/admin/runs', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of runs', function (done) {
            agent
                .get('http://localhost:9615/api/admin/runs')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 6);
                    done();
                });
        });
    });

    describe('GET /api/admin/run/active', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of runs', function (done) {
            agent
                .post('http://localhost:9615/api/admin/run/active')
                .send({id: 6})
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, "done");
                    request(app)
                        .get('/api/run/list')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body.length, 6);
                            return done();
                        });
                });
        });
    });
});


function loginUser(agent) {
    return function(done) {
        agent
            .post('http://localhost:9615/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);

        function onResponse(err, res) {
            return done();
        }
    };
}