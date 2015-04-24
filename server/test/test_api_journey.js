/**
 * Created by jeremy on 07/02/15.
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

describe('Test of journey API', function () {

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
                            var fixtures = require('./fixtures/invoices.json');
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
                        }
                    ], function (err, result) {
                        done();
                    });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API journey over !');
    });

    describe('GET /api/admin/journeys', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of 3 runs', function (done) {
            agent
                .get('http://localhost:9615/api/admin/journeys')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 4);
                    return done();
                });
        });
    });

    describe('GET /api/journey/open', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/journey/open')
                .expect(200, done);
        });
        it('should return list of 2 runs', function (done) {
            request(app)
                .get('/api/journey/open')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/journey/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/journey/1')
                .expect(200, done);
        });
        it('should return Saint Germain en Laye journey', function (done) {
            request(app)
                .get('/api/journey/1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.res.body.address_start, 'Saint-Germain-en-Laye, France');
                    assert.equal(res.res.body.distance, '585 km');
                    assert.equal(res.res.body.duration, '5 heures 29 minutes');
                    assert.equal(res.res.body.journey_type, 'aller-retour');
                    assert.equal(res.res.body.time_start_outward, '06:00');
                    assert.equal(res.res.body.nb_space_outward, 2);
                    assert.equal(res.res.body.time_start_return, '09:00');
                    assert.equal(res.res.body.nb_space_return, 3);
                    assert.equal(res.res.body.car_type, 'monospace');
                    assert.equal(res.res.body.amount, 23);
                    assert.equal(res.res.body.RunId, 5);
                    assert.equal(res.res.body.UserId, 1);
                    assert.equal(res.res.body.Run.name, 'Marathon du médoc');
                    return done();
                });
        });
    });

    describe('GET /api/journey/run/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/journey/run/2')
                .expect(200, done);
        });
        it('should return list of 1 journey', function (done) {
            request(app)
                .get('/api/journey/run/4')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0].address_start, 'Rouen');
                    return done();
                });
        });
    });

    describe('GET /api/journey/next/:nb', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/journey/next/2')
                .expect(200, done);
        });
        it('should return list of 2 journey', function (done) {
            request(app)
                .get('/api/journey/next/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('POST /api/journey', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create a journey', function (done) {
            var journey = {
                id: 5,
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2014-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2014-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                RunId: 4,
                UserId: 1
            };
            agent
                .post('http://localhost:9615/api/journey')
                .send({journey: journey})
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    agent
                        .get('http://localhost:9615/api/admin/journeys')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body.length, 5);
                            return done();
                        });
                });
        });
    });

    describe('GET /api/journey/book/:id', function () {
        it('should return book space for journey 1', function (done) {
            request(app)
                .get('/api/journey/book/1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.res.body.outward, 2);
                    assert.equal(res.res.body.return, 2);
                    return done();
                });
        });
    });

    describe('GET /api/admin/journey/payed', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should define journey 2 as payed', function(done) {
            agent
                .post('http://localhost:9615/api/admin/journey/payed')
                .send({id: '2'})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'journeyTogglePayed');
                    request(app)
                        .get('/api/journey/2')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.res.body.is_payed, true);
                            return done();
                        });
                });
        });
    });

    describe('POST /api/journey/cancel', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should cancel journey 3', function(done) {
            agent
                .post('http://localhost:9615/api/journey/cancel')
                .send({id: '3'})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'journeyCanceled');
                    request(app)
                        .get('/api/journey/3')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.res.body.is_canceled, true);
                            return done();
                        });
                });
        });
    });
});