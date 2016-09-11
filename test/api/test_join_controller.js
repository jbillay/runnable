/**
 * Created by jeremy on 11/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Join = require('../../server/controllers/join');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of join controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of join controller is over !');
    });

    describe('Test create', function () {
        it('Should create a join for a user with success', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.save = function (invoice, user, callback) { callback(null, {id: 1}); };
            stubInvoice.prototype.set = function (invoice) { return invoice; };
            var stubJoin = function join() {};
            stubJoin.prototype.save = function (join, user, callback) { callback(null, {id: 1}); };
            stubJoin.prototype.set = function (join) { return join; };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/invoice': stubInvoice, '../objects/join': stubJoin});
            var req = { body: { id: 1},
                        user: { id: 1 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.create(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'userJoined', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should create a join but fail on join creation', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.save = function (invoice, user, callback) { callback(null, {id: 1}); };
            stubInvoice.prototype.set = function (invoice) { return invoice; };
            var stubJoin = function join() {};
            stubJoin.prototype.save = function (join, user, callback) { callback('Mock to fail', null); };
            stubJoin.prototype.set = function (join) { return join; };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/invoice': stubInvoice, '../objects/join': stubJoin});
            var req = { body: { id: 1},
                        user: { id: 1 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.create(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'notJoined', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should create a join but fail on invoice creation', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.save = function (invoice, user, callback) { callback('Mock to fail', null); };
            stubInvoice.prototype.set = function (invoice) { return invoice; };
            var stubJoin = function join() {};
            stubJoin.prototype.save = function (join, user, callback) { callback(null, {id: 1}); };
            stubJoin.prototype.set = function (join) { return join; };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/invoice': stubInvoice, '../objects/join': stubJoin});
            var req = { body: { id: 1},
                        user: { id: 1 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.create(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'notJoined', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test listForJourney', function () {
        it('Should get a list of joins for a journey with success', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.getByJourney = function (id, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.listForJourney(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get a list of joins for a journey which failed', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.getByJourney = function (id, callback) { callback('Mock to fail', null); };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.listForJourney(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test detail', function () {
        it('Should get detail of a journey with success', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.getById = function (id, callback) { callback(null, {id: 1}); };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.detail(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get detail of a journey which failed', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.getById = function (id, callback) { callback('Mock to fail', null); };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.detail(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test list', function () {
        it('Should get a list of all joins with success', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.getList = function (callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.list(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get a list of all joins which failed', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.getList = function (callback) { callback('Mock to fail', null); };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.list(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test cancel', function () {
        it('Should cancel a join for a user with success', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.cancelById = function (id, user, notif) { { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } };
            var Join = proxyquire('../../server/controllers/join', {'../objects/join': stubJoin});
            var req = { params: { id: 1}, user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.cancel(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'joinCancelled', type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should cancel a join for a user which failed', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.cancelById = function (id, user, notif) { { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { params: { id: 1}, user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.cancel(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'joinNotCancelled', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test toRefund', function () {
        it('Should get a list of join to refund with success', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.toRefund = function () { { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; } };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.toRefund(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should get a list of join to refund which failed', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.toRefund = function () { { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.toRefund(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test refund', function () {
        it('Should tag a join as refund with success', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.refund = function (id) { { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { body: { id: 1 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.refund(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {id: 1}, type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should tag a join as refund which failed', function (done) {
            var stubJoin = function join() {};
            stubJoin.prototype.refund = function (id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Join = proxyquire('../../server/controllers/join',
                {'../objects/join': stubJoin});
            var req = { body: { id: 1 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Join.refund(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
});