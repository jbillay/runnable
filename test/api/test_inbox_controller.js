/**
 * Created by jeremy on 11/08/2016.
 */


'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Inbox = require('../../server/controllers/inbox');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of inbox controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of inbox controller is over !');
    });

    describe('Test add', function () {
        it('Should add a message into user inbox with success', function (done) {
            var stub = function inbox() {};
            stub.prototype.add = function (template, value, userId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { template: 'toto', value: {id: 1}, userId: 2 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.add(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should add a message into user inbox which failed', function (done) {
            var stub = function inbox() {};
            stub.prototype.add = function (template, value, userId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { template: 'toto', value: {id: 1}, userId: 2 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.add(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'notAbleAddMessage', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getList', function () {
        it('Should get list of inbox messages for a user with success', function (done) {
            var stub = function inbox() {};
            stub.prototype.getList = function (user, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.getList(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get list of inbox messages for a user which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.getList = function (user, callback) { callback('Mock to fail', null); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.getList(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'notAbleGetMessage', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test read', function () {
        it('Should read a inbox message for a user with success', function (done) {
            var stub = function inbox() {};
            stub.prototype.setIsRead = function (id, isRead, callback) { callback(null, {id: 1}); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { messageId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.read(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'messageRead', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should read a inbox message for a user which failed', function (done) {
            var stub = function inbox() {};
            stub.prototype.setIsRead = function (id, isRead, callback) { callback('Mock to fail', null); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { messageId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.read(req, res);
            assert.isTrue(spyRes.withArgs({ msg: 'NotAbleMessageRead', type: 'error' }).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test unread', function () {
        it('Should unread a inbox message for a user with success', function (done) {
            var stub = function inbox() {};
            stub.prototype.setIsRead = function (id, isRead, callback) { callback(null, {id: 1}); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { messageId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.unread(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'messageUnread', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should unread a inbox message for a user which failed', function (done) {
            var stub = function inbox() {};
            stub.prototype.setIsRead = function (id, isRead, callback) { callback('Mock to fail', null); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { messageId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.unread(req, res);
            assert.isTrue(spyRes.withArgs({ msg: 'NotAbleUnreadMessage', type: 'error' }).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test countUnread', function () {
        it('Should count unread inbox messages for a user with success', function (done) {
            var stub = function inbox() {};
            stub.prototype.countUnread = function (user, callback) { callback(null, 2); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.countUnread(req, res);
            assert.isTrue(spyRes.withArgs(2).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should count unread inbox messages for a user which failed', function (done) {
            var stub = function discussion() {};
            stub.prototype.countUnread = function (user, callback) { callback('Mock to fail', null); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.countUnread(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'NotAbleCountUnreadMessage', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test delete', function () {
        it('Should delete a inbox message for a user with success', function (done) {
            var stub = function inbox() {};
            stub.prototype.delete = function (id, callback) { callback(null, {id: 1}); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { messageId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.delete(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'messageDeleted', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should delete a inbox message for a user which failed', function (done) {
            var stub = function inbox() {};
            stub.prototype.delete = function (id, callback) { callback('Mock to fail', null); };
            var Inbox = proxyquire('../../server/controllers/inbox',
                {'../objects/inbox': stub});
            var req = { body: { messageId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Inbox.delete(req, res);
            assert.isTrue(spyRes.withArgs({ msg: 'NotAbleDeleteMessage', type: 'error' }).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
});