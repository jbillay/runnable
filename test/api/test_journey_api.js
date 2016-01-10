/**
 * Created by jeremy on 07/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var request = require('supertest'),
    models = require('../../server/models/index'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    sinon = require('sinon'),
    settings = require('../../conf/config'),
    superagent = require('superagent'),
    redis = require('redis'),
    Rclient = redis.createClient();

function loginUser(agent) {
    return function(done) {
        function onResponse(err, res) {
            return done();
        }

        agent
            .post('http://localhost:' + settings.port + '/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);
    };
}

describe('Test of journey API', function () {

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
    after(function () {
        console.log('Test API journey over !');
    });

    describe('GET /api/admin/journeys', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of 4 journeys', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/journeys')
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
        it('should return list of 2 journey', function (done) {
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
                    assert.equal(res.body[0].address_start, 'Toulon, France');
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

    describe('POST /api/journey with auth user', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create a journey', function (done) {
            var journey = {
                id: 5,
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2016-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2016-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                UserId: 1,
                Run: {
                    id: 4
                }
            };
            agent
                .post('http://localhost:' + settings.port + '/api/journey')
                .send({journey: journey})
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.journey.address_start, 'Paris');
                    assert.equal(res.body.journey.distance, '25 km');
                    assert.equal(res.body.journey.duration, '20 minutes');
                    assert.equal(res.body.journey.journey_type, 'aller-retour');
                    assert.equal(res.body.journey.time_start_outward, '09:00');
                    assert.equal(res.body.journey.nb_space_outward, 2);
                    assert.equal(res.body.journey.time_start_return, '09:00');
                    assert.equal(res.body.journey.nb_space_return, 2);
                    assert.equal(res.body.journey.car_type, 'citadine');
                    assert.equal(res.body.journey.amount, 5);
                    assert.equal(res.body.journey.RunId, 4);
                    assert.equal(res.body.journey.UserId, 1);

                    agent
                        .get('http://localhost:' + settings.port + '/api/admin/journeys')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.body.length, 4);
                            agent
                                .get('http://localhost:' + settings.port + '/api/journey/5')
                                .end(function (err, res) {
                                    if (err) return done(err);
                                    assert.equal(res.res.body.address_start, 'Paris');
                                    assert.equal(res.res.body.distance, '25 km');
                                    assert.equal(res.res.body.duration, '20 minutes');
                                    assert.equal(res.res.body.journey_type, 'aller-retour');
                                    assert.equal(res.res.body.time_start_outward, '09:00');
                                    assert.equal(res.res.body.nb_space_outward, 2);
                                    assert.equal(res.res.body.time_start_return, '09:00');
                                    assert.equal(res.res.body.nb_space_return, 2);
                                    assert.equal(res.res.body.car_type, 'citadine');
                                    assert.equal(res.res.body.amount, 5);
                                    assert.equal(res.res.body.RunId, 4);
                                    assert.equal(res.res.body.UserId, 1);
                                    assert.equal(res.res.body.Run.name, 'Corrida de Saint Germain en Laye');
                                    return done();
                                });
                        });
                });
        });
    });

    describe('POST /api/journey with no auth user', function () {
        var agent = superagent.agent();

        it('should create a journey with a draft', function (done) {
            var journey = {
                id: 5,
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2016-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2016-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                UserId: 1,
                Run: {
                    id: 4
                }
            };
            agent
                .post('http://localhost:' + settings.port + '/api/journey')
                .send({journey: journey})
                .end(function (err, res) {
                    if (err) return done(err);
                    // TODO: mock redis key generated
                    // assert.equal(res.body.journeyKey, 'JNK82773');
                    return done();
                });
        });

        it('should create a journey with a draft for a partner', function (done) {
            var journey = {
                id: 5,
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2016-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2016-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwODgsImV4cCI6MTIwNTA5MjA1MTh9.w17cboqKDtjpsJzeu21C5OEwiei1_Ay2d_BO58mpFcs',
                UserId: 1,
                Run: {
                    id: 4
                }
            };
            agent
                .post('http://localhost:' + settings.port + '/api/journey')
                .send({journey: journey})
                .end(function (err, res) {
                    if (err) return done(err);
                    // TODO: mock redis key generated
                    // assert.equal(res.body.journeyKey, 'JNK82773');
                    assert.equal(res.body.msg, 'draftJourneyCreated');
                    return done();
                });
        });
    });

    describe('POST /api/journey/confirm', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should confirm a draft journey', function (done) {
            var journey = {
                id: 5,
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2016-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2016-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                UserId: 1,
                Run: {
                    id: 4
                }
            };
            var journeyString = JSON.stringify(journey),
                journeyKey = 'JNY' + Math.floor(Math.random() * 100000);
            Rclient.set(journeyKey, journeyString, redis.print);

            agent
                .post('http://localhost:' + settings.port + '/api/journey/confirm')
                .send({key: journeyKey})
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.msg, 'draftJourneySaved');
                    return done();
                });
        });

        it('should confirm a draft journey to a partner', function (done) {
            var journey = {
                id: 5,
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2016-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2016-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwODgsImV4cCI6MTIwNTA5MjA1MTh9.w17cboqKDtjpsJzeu21C5OEwiei1_Ay2d_BO58mpFcs',
                UserId: 1,
                Run: {
                    id: 4
                }
            };
            var journeyString = JSON.stringify(journey),
                journeyKey = 'JNY' + Math.floor(Math.random() * 100000);
            Rclient.set(journeyKey, journeyString, redis.print);

            agent
                .post('http://localhost:' + settings.port + '/api/journey/confirm')
                .send({key: journeyKey})
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.msg, 'draftJourneySaved');
                    return done();
                });
        });
    });

    describe('PUT /api/journey', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should update an existing journey', function (done) {
            var journey = {
                id: 2,
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
                UserId: 2,
                Run: {
                    id: 4
                }
            };
            agent
                .put('http://localhost:' + settings.port + '/api/journey')
                .send({journey: journey})
                .end(function (err, res) {
                    if (err) return done(err);
                    agent
                        .get('http://localhost:' + settings.port + '/api/journey/2')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.res.body.address_start, 'Paris');
                            assert.equal(res.res.body.distance, '25 km');
                            assert.equal(res.res.body.duration, '20 minutes');
                            assert.equal(res.res.body.journey_type, 'aller-retour');
                            assert.equal(res.res.body.time_start_outward, '09:00');
                            assert.equal(res.res.body.nb_space_outward, 2);
                            assert.equal(res.res.body.time_start_return, '09:00');
                            assert.equal(res.res.body.nb_space_return, 2);
                            assert.equal(res.res.body.car_type, 'citadine');
                            assert.equal(res.res.body.amount, 5);
                            assert.equal(res.res.body.RunId, 4);
                            assert.equal(res.res.body.UserId, 2);
                            assert.equal(res.res.body.Run.name, 'Corrida de Saint Germain en Laye');
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
                .post('http://localhost:' + settings.port + '/api/admin/journey/payed')
                .send({id: '2'})
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'journeyTogglePayed');
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
                .post('http://localhost:' + settings.port + '/api/journey/cancel')
                .send({id: '3'})
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'journeyCanceled');
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

    describe('POST /api/journey with auth user for a partner', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create a journey with a partner', function (done) {
            // Check if email has been sent to owner user:1 and partner user:2
            var journey = {
                id: 5,
                address_start: 'Paris',
                distance: '25 km',
                duration: '20 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2016-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2016-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 5,
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNDgsImV4cCI6MTIwNTA5NjA2NjF9.-vmI9gHnCFX30N2oVhQLiADX-Uz2XHzrHjWjJpvSERo',
                UserId: 1,
                Run: {
                    id: 4
                }
            };
            agent
                .post('http://localhost:' + settings.port + '/api/journey')
                .send({journey: journey})
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.journey.address_start, 'Paris');
                    assert.equal(res.body.journey.distance, '25 km');
                    assert.equal(res.body.journey.duration, '20 minutes');
                    assert.equal(res.body.journey.journey_type, 'aller-retour');
                    assert.equal(res.body.journey.time_start_outward, '09:00');
                    assert.equal(res.body.journey.nb_space_outward, 2);
                    assert.equal(res.body.journey.time_start_return, '09:00');
                    assert.equal(res.body.journey.nb_space_return, 2);
                    assert.equal(res.body.journey.car_type, 'citadine');
                    assert.equal(res.body.journey.amount, 5);
                    assert.equal(res.body.journey.RunId, 4);
                    assert.equal(res.body.journey.UserId, 1);
                    assert.equal(res.body.journey.PartnerId, 1);
                    return done();
                    //agent
                    //    .get('http://localhost:' + settings.port + '/api/inbox/msg')
                    //    .end(function (err, res) {
                    //        if (err) return done(err);
                    //        console.log(res.body);
                    //        assert.equal(res.body.length, 4);
                    //        return done();
                    //    });
                });
        });
    });
});