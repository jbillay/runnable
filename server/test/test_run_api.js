/**
 * Created by jeremy on 04/02/15.
 */
'use strict';

var request = require('supertest'),
    models = require('../models'),
    assert = require('chai').assert,
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

function loginUser(agent) {
    return function(done) {
        function onResponse(err, res) {
            return done();
        }

        agent
            .post('http://localhost:9615/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);
    };
}

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
        console.log('Test API run over !');
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
                    assert.equal(res.res.body.name, 'Maxicross');
                    assert.equal(res.res.body.type, 'trail');
                    assert.equal(res.res.body.address_start, 'Bouffémont, France');
                    assert.equal(res.res.body.time_start, '09:15');
                    assert.equal(res.res.body.distances, '15k - 30k - 7k');
                    assert.equal(res.res.body.elevations, '500+ - 1400+');
                    assert.equal(res.res.body.info, 'Toutes les infos sur le maxicross');
                    assert.equal(res.res.body.is_active, 1);
                    done();
                });
        });
        it('should failed to retrieve a run', function (done) {
            request(app)
                .get('/api/run/-1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var obj = {};
                    assert.deepEqual(res.body, obj);
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
        it('should return failed to return runs', function (done) {
            request(app)
                .get('/api/run/next/a')
                .end(function (err, res) {
                    if (err) return done(err);
                    console.log(res.body);
                    assert.equal(res.body.type, 'error');
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

        it('should active a run', function (done) {
            agent
                .post('http://localhost:9615/api/admin/run/active')
                .send({id: 6})
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.msg, 'done');
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

        it('should failed to activate the run -1', function (done) {
            agent
                .post('http://localhost:9615/api/admin/run/active')
                .send({id: -1})
                .end(function (err, res) {
                    assert.isNotNull(res.body.msg);
                    return done();
                });
        });
    });

    describe('POST /api/run', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create a run', function (done) {
            var run = {
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
            };
            agent
                .post('http://localhost:9615/api/run')
                .send({run: run})
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    agent
                        .get('http://localhost:9615/api/admin/runs')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body.length, 7);
                            return done();
                        });
                });
        });
    });
    describe('POST /api/run/search', function () {
        it('should return a Maxicross runs', function (done) {
            var searchInfo = {
                    run_adv_type: 'trail',
                    run_adv_start_date: '2015-02-01 00:00:00',
                    run_adv_end_date: '2015-02-10 00:00:00',
                    run_adv_city: '',
                    run_name: 'maxi'
                };
            request(app)
                .post('/api/run/search')
                .send(searchInfo)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
    });
});
