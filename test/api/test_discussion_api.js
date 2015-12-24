/**
 * Created by jeremy on 04/03/15.
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
            .post('http://localhost:' + settings.port + '/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);
    };
}

describe('Test of Discussion API', function () {

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
                        var fixtures = require('./fixtures/options.json');
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
                    }
                ], function (err, result) {
                    done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API discussion over !');
    });

    describe('GET /api/discussion/users/:id', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return users for Journey 2', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/discussion/users/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });

        it('should return users for Journey 3', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/discussion/users/1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0].firstname, 'Jeremy');
                    assert.equal(res.body[0].lastname, 'Billay');
                    assert.equal(res.body[0].email, 'jbillay@gmail.com');
                    return done();
                });
        });

        it('should return users for a not existing Journey', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/discussion/users/876')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'error');
                    return done();
                });
        });
    });

    describe('GET /api/discussion/messages/:id', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return private messages for Journey 3', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/discussion/private/messages/3')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0].message, 'Super cette discussion');
                    return done();
                });
        });

        it('should return public messages for Journey 3', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/discussion/public/messages/3')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 2);
                    assert.equal(res.body[0].message, 'C est notre site mon ami !!!');
                    return done();
                });
        });
    });

    describe('POST /api/discussion/message', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should add a private messages for Journey 3', function (done) {
            var message = {
                message: 'TEST MESSAGE',
                is_public: false,
                journeyId: 3
            };
            agent
                .post('http://localhost:' + settings.port + '/api/discussion/private/message')
                .send(message)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.msg, 'ok');
                    agent
                        .get('http://localhost:' + settings.port + '/api/discussion/private/messages/3')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.body.length, 2);
                            return done();
                        });
                });
        });

        it('should add a public messages for Journey 3 on auth user', function (done) {
            var message = {
                message: 'TEST MESSAGE PUBLIC',
                is_public: true,
                journeyId: 3
            };
            agent
                .post('http://localhost:' + settings.port + '/api/discussion/public/message')
                .send(message)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.msg, 'ok');
                    agent
                        .get('http://localhost:' + settings.port + '/api/discussion/public/messages/3')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body.length, 3);
                            return done();
                        });
                });
        });
    });
});