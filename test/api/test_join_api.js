/**
 * Created by jeremy on 10/02/15.
 */

'use strict';

var request = require('supertest'),
    models = require('../../server/models/index'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    async = require('async'),
    q = require('q'),
    settings = require('../../conf/config'),
    superagent = require('superagent');

var loadData = function (fix) {
    var deferred = q.defer();
    models[fix.model].create(fix.data)
        .complete(function (err, result) {
            if (err) {
                return deferred.reject('error ' + err);
            }
            return deferred.resolve(result);
        });
    return deferred.promise;
};

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

describe('Test of join API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        this.timeout(settings.timeout);
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
        console.log('Test API join over !');
    });

    describe('GET /api/join/journey/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/join/journey/2')
                .expect(200, done);
        });
        it('should return joins for run 2', function (done) {
            request(app)
                .get('/api/join/journey/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    done();
                });
        });
    });

    describe('GET /api/join/:id', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return join 1 info', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/join/1')
                .end(function (err, res) {
                    assert.equal(res.body.nb_place_outward, 2);
                    assert.equal(res.body.nb_place_return, 2);
                    assert.equal(res.body.UserId, 1);
                    assert.equal(res.body.JourneyId, 1);
                    return done();
                });
        });
    });

    describe('GET /api/admin/joins', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of all joins', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/joins')
                .end(function (err, res) {
                    assert.equal(res.body.length, 4);
                    return done();
                });
        });
    });
	
    describe('POST /api/join', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create a new join', function(done) {

            var join = {
                    id: 5,
                    nb_place_outward: 1,
                    nb_place_return: 1,
                    amount: 50.96,
                    fees: 3.74,
                ref: 'MRT201502215K753',
                    status: 'pending',
                    journey_id: 3
                };
            agent
                .post('http://localhost:' + settings.port + '/api/join')
                .send(join)
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'userJoined');
                    agent
                        .get('http://localhost:' + settings.port + '/api/admin/joins')
                        .end(function (err, res) {
                            assert.equal(res.body.length, 5);
                            return done();
                        });
                });
        });
    });

    describe('GET /api/join/cancel/:id', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should cancel join 1', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/join/cancel/1')
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'joinCancelled');
                    return done();
                });
        });

        it('Try to cancel a join that not exist', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/join/cancel/42')
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'joinNotCancelled');
                    return done();
                });
        });
    });
});
