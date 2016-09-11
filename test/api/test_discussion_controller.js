/**
 * Created by jeremy on 10/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Discussion = require('../../server/controllers/discussion');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of discussion controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of discussion controller is over !');
    });

    describe('Test getUsers', function () {
        it('Should get users of a discussion with success', function (done) {
            var stub = function discussion() {};
            stub.prototype.getUsers = function (id) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.getUsers(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should get users of a discussion which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.getUsers = function (id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.getUsers(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getPublicMessages', function () {
        it('Should get public message for a journey with success', function (done) {
            var stub = function discussion() {};
            stub.prototype.getMessages = function (id, is_public, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.getPublicMessages(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get public message for a journey which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.getMessages = function (id, is_public, callback) { callback('Mock to fail', null); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.getPublicMessages(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test getPrivateMessages', function () {
        it('Should get private message for a journey with success', function (done) {
            var stub = function discussion() {};
            stub.prototype.getMessages = function (id, is_public, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.getPrivateMessages(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get private message for a journey which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.getMessages = function (id, is_public, callback) { callback('Mock to fail', null); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.getPrivateMessages(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test addPrivateMessage', function () {
        it('Should add private message for a journey with success', function (done) {
            var stub = function discussion() {};
            stub.prototype.addMessage = function (message, journeyId, is_public, user, email, callback) { callback(null, {id: 1}); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { body: {
                            journeyId: 1,
                            message: 'toto' },
                        user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Discussion.addPrivateMessage(req, res, spyNext);
            assert.isTrue(spyRes.notCalled);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.notifMessage.journeyId, 1);
            assert.equal(req.notifMessage.message, 'toto');
            assert.equal(req.notifMessage.is_public, false);
            assert.equal(req.notifMessage.user.id, 1);
            res.jsonp.restore();
            return done();
        });

        it('Should add private message for a journey which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.addMessage = function (message, journeyId, is_public, user, email, callback) { callback('Mock to fail', null); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { body: {
                    journeyId: 1,
                    message: 'toto' },
                    user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Discussion.addPrivateMessage(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test addPublicMessage', function () {
        it('Should add public message for a journey with success', function (done) {
            var stub = function discussion() {};
            stub.prototype.addMessage = function (message, journeyId, is_public, user, email, callback) { callback(null, {id: 1}); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { body: {
                    journeyId: 1,
                    message: 'toto' },
                    user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Discussion.addPublicMessage(req, res, spyNext);
            assert.isTrue(spyRes.notCalled);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.notifMessage.journeyId, 1);
            assert.equal(req.notifMessage.message, 'toto');
            assert.equal(req.notifMessage.is_public, true);
            assert.equal(req.notifMessage.user.id, 1);
            res.jsonp.restore();
            return done();
        });

        it('Should add public message for a journey which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.addMessage = function (message, journeyId, is_public, user, email, callback) { callback('Mock to fail', null); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { body: {
                    journeyId: 1,
                    message: 'toto' },
                    user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Discussion.addPublicMessage(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test notificationMessage', function () {
        it('Should notify a message for a journey with success', function (done) {
            var stub = function discussion() {};
            stub.prototype.notificationMessage = function (journeyId, message, is_public, user, callback) { callback(null, {id: 1}); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { notifMessage: {
                            journeyId: 1,
                            message: 'toto',
                            is_public: true,
                            user: { id: 1 } }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.notificationMessage(req, res);
            assert.isTrue(spyRes.withArgs({msg: {id: 1}, type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should notify a message for a journey which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.notificationMessage = function (journeyId, message, is_public, user, callback) { callback('Mock to fail', null); };
            var Discussion = proxyquire('../../server/controllers/discussion',
                {'../objects/discussion': stub});
            var req = { notifMessage: {
                    journeyId: 1,
                    message: 'toto',
                    is_public: true,
                    user: { id: 1 } }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Discussion.notificationMessage(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
});