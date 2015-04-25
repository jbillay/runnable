/**
 * Created by jeremy on 04/03/15.
 */
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


describe('Test of Inbox API', function () {
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
                        var fixtures = require('./fixtures/options.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/inboxes.json');
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
        console.log('Test of API bank account over !');
    });

    describe('GET /api/inbox/msg', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return current user messages', function (done) {
            agent
                .get('http://localhost:9615/api/inbox/msg')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/inbox/unread/nb/msg', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return current user unread messages', function (done) {
            agent
                .get('http://localhost:9615/api/inbox/unread/nb/msg')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body, 1);
                    return done();
                });
        });
    });

    describe('POST /api/inbox/msg', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return create a new message', function (done) {
            var message = {
                template: 'inboxTest',
                values: {
                    message: 'message Inbox',
                    userId: 3
                },
                userId: 2
            };
            agent
                .post('http://localhost:9615/api/inbox/msg')
                .send(message)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.title, 'Email pour 3');
                    assert.equal(res.body.message, 'TEST message Inbox');
                    assert.equal(res.body.UserId, message.userId);
                    return done();
                });
        });
    });

    describe('POST /api/inbox/msg/read', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should make a message read', function (done) {
            var message = {
                messageId: 2
            };
            agent
                .post('http://localhost:9615/api/inbox/msg/read')
                .send(message)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    agent
                        .get('http://localhost:9615/api/inbox/unread/nb/msg')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            var emptyObject = {};
                            assert.deepEqual(res.body, emptyObject);
                            return done();
                        });
                });
        });
    });

    describe('POST /api/inbox/msg/unread', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should make a message read', function (done) {
            var message = {
                messageId: 3
            };
            agent
                .post('http://localhost:9615/api/inbox/msg/unread')
                .send(message)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    agent
                        .get('http://localhost:9615/api/inbox/unread/nb/msg')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body, 2);
                            return done();
                        });
                });
        });
    });

    describe('POST /api/inbox/msg/delete', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should delete message 1', function (done) {
            var message = {
                messageId: 2
            };
            agent
                .post('http://localhost:9615/api/inbox/msg/delete')
                .send(message)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.msg, 'messageDeleted');
                    agent
                        .get('http://localhost:9615/api/inbox/msg')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body.length, 1);
                            return done();
                        });
                });
        });
    });
});