/**
 * Created by jeremy on 04/03/15.
 */
/**
 * Created by jeremy on 04/02/15.
 */
'use strict';

var request = require('supertest'),
    models = require('../../server/models/index'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    settings = require('../../conf/config'),
    superagent = require('superagent');

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


describe('Test of Inbox API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
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
                .get('http://localhost:' + settings.port + '/api/inbox/msg')
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
                .get('http://localhost:' + settings.port + '/api/inbox/unread/nb/msg')
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
                .post('http://localhost:' + settings.port + '/api/inbox/msg')
                .send(message)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.title, 'Email pour 3');
                    assert.include(res.body.message, 'TEST message Inbox');
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
                .post('http://localhost:' + settings.port + '/api/inbox/msg/read')
                .send(message)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    agent
                        .get('http://localhost:' + settings.port + '/api/inbox/unread/nb/msg')
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
                .post('http://localhost:' + settings.port + '/api/inbox/msg/unread')
                .send(message)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    agent
                        .get('http://localhost:' + settings.port + '/api/inbox/unread/nb/msg')
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
                .post('http://localhost:' + settings.port + '/api/inbox/msg/delete')
                .send(message)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.msg, 'messageDeleted');
                    agent
                        .get('http://localhost:' + settings.port + '/api/inbox/msg')
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