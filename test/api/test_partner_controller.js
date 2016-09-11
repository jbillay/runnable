/**
 * Created by jeremy on 11/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Partner = require('../../server/controllers/partner');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of partner controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of partner controller is over !');
    });

    describe('Test create', function () {
        it('Should create a partner with success', function (done) {
            var stub = function partner() {};
            stub.prototype.create = function (name, fee, expiry, user, callback) { return callback(null, {id: 1, name: 'toto'}); };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = { body: {
                    partner: {name: 'titi', fee: '0', expiry: '2016-07-09', user: {id: 1}} } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Partner.create(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: {id: 1, name: 'toto'}, type: 'success'}).calledOnce);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.partner.id, 1);
            assert.equal(req.partner.name, 'toto');
            res.jsonp.restore();
            return done();
        });
        it('Should create a partner which failed', function (done) {
            var stub = function partner() {};
            stub.prototype.create = function (name, fee, expiry, user, callback) { return callback('Mock to fail', null); };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = { body: {
                    partner: {name: 'titi', fee: '0', expiry: '2016-07-09', user: {id: 1}} } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Partner.create(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.partner);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test getList', function () {
        it('Should get list of partners with success', function (done) {
            var stub = function partner() {};
            stub.prototype.getList = function (old, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Partner.getList(req, res);
            assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of partners which failed', function (done) {
            var stub = function partner() {};
            stub.prototype.getList = function (old, callback) { return callback('Mock to fail', null); };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Partner.getList(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test getByToken', function () {
        it('Should get a partner with his token with success', function (done) {
            var stub = function partner() {};
            stub.prototype.getByToken = function (token) { var deferred = q.defer(); deferred.resolve({id: 1, name: 'toto'}); return deferred.promise; };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = {params: {token: 'DLSKJD343'}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Partner.getByToken(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {id: 1, name: 'toto'}, type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get a partner with his token which failed', function (done) {
            var stub = function partner() {};
            stub.prototype.getByToken = function (token) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = {params: {token: 'DLSKJD343'}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Partner.getByToken(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test sendInfo', function () {
        it('Should send info to partner with success', function (done) {
            var stub = function partner() {};
            stub.prototype.sendInfo = function (id) { var deferred = q.defer(); deferred.resolve({id: 1, name: 'toto'}); return deferred.promise; };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = { body: {partner: {id: 'DLSKJD343'} } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Partner.sendInfo(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {id: 1, name: 'toto'}, type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should send info to partner which failed', function (done) {
            var stub = function partner() {};
            stub.prototype.sendInfo = function (id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = { body: {partner: {id: 'DLSKJD343'} } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Partner.sendInfo(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test notifyJourneyCreation', function () {
        it('Should send journey notification to partner with success', function (done) {
            var stub = function partner() {};
            stub.prototype.notifyJourneyCreation = function (run, journey) { var deferred = q.defer(); deferred.resolve({id: 1, name: 'toto'}); return deferred.promise; };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = { Run: { id: 1 }, Journey: {id: 1 } },
                res = {};
            Partner.notifyJourneyCreation(req, res);
            process.nextTick(function () {
                return done();
            });
        });
        it('Should send journey notification to partner which failed', function (done) {
            var stub = function partner() {};
            stub.prototype.notifyJourneyCreation = function (run, journey) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Partner = proxyquire('../../server/controllers/partner',
                {'../objects/partner': stub});
            var req = { Run: { id: 1 }, Journey: {id: 1 } },
                res = {};
            Partner.notifyJourneyCreation(req, res);
            process.nextTick(function () {
                return done();
            });
        });
    });
});
