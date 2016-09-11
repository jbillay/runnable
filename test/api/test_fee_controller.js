/**
 * Created by jeremy on 10/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Fee = require('../../server/controllers/fee');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of fees controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of fees controller is over !');
    });

    describe('Test getFee', function () {
        it('Should get fee for a journey with success', function (done) {
            var stub = function fee() {};
            stub.prototype.getForUser = function (userId, journeyId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { params: { journeyId: 1 },
                        user: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.getFee(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: { id: 1 }, type: 'success' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should get fee for a journey which failed', function (done) {
            var stub = function fee() {};
            stub.prototype.getForUser = function (userId, journeyId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { params: { journeyId: 1 },
                        user: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.getFee(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getDefaultFee', function () {
        it('Should get default fee with success', function (done) {
            var stub = function fee() {};
            stub.prototype.getDefault = function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.getDefaultFee(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: { id: 1 }, type: 'success' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should get default fee which failed', function (done) {
            var stub = function fee() {};
            stub.prototype.getDefault = function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.getDefaultFee(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getList', function () {
        it('Should get fee list with success', function (done) {
            var stub = function fee() {};
            stub.prototype.getList = function () { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.getList(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: [{id: 1}, {id: 2}], type: 'success' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should get fee list which failed', function (done) {
            var stub = function fee() {};
            stub.prototype.getList = function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.getList(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test add', function () {
        it('Should add a fee with success', function (done) {
            var stub = function fee() {};
            stub.prototype.add = function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { body: {
                    fee: {
                        code: 'titi',
                        percentage: 0.1,
                        value: 20,
                        discount: 0.2,
                        remaining: 0,
                        start_date: '2016-02-03',
                        end_date: '2016-03-06',
                        UserId: 1,
                        RunId: 2
                    }
                }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.add(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: {id: 1}, type: 'success' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should add fee which failed', function (done) {
            var stub = function fee() {};
            stub.prototype.add = function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { body: {
                    fee: {
                        code: 'titi',
                        percentage: 0.1,
                        value: 20,
                        discount: 0.2,
                        remaining: 0,
                        start_date: '2016-02-03',
                        end_date: '2016-03-06',
                        UserId: 1,
                        RunId: 2
                    }
                }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.add(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test update', function () {
        it('Should update fee with success', function (done) {
            var stub = function fee() {};
            stub.prototype.update = function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { body: {
                    fee: {
                        id: 1,
                        code: 'titi',
                        percentage: 0.1,
                        value: 20,
                        discount: 0.2,
                        remaining: 0,
                        default: false,
                        start_date: '2016-02-03',
                        end_date: '2016-03-06',
                        UserId: 1,
                        RunId: 2
                    }
                }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.update(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: {id: 1}, type: 'success' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should update fee which failed', function (done) {
            var stub = function fee() {};
            stub.prototype.update = function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { body: {
                    fee: {
                        id: 1,
                        code: 'titi',
                        percentage: 0.1,
                        value: 20,
                        discount: 0.2,
                        remaining: 0,
                        default: false,
                        start_date: '2016-02-03',
                        end_date: '2016-03-06',
                        UserId: 1,
                        RunId: 2
                    }
                }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.update(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test delete', function () {
        it('Should delete fee with success', function (done) {
            var stub = function fee() {};
            stub.prototype.remove = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.delete(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: { id: 1 }, type: 'success' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should delete fee which failed', function (done) {
            var stub = function fee() {};
            stub.prototype.remove = function (id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.delete(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test checkCode', function () {
        it('Should delete fee with success', function (done) {
            var stub = function fee() {};
            stub.prototype.checkCode = function (code) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { params: { code: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.checkCode(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: { id: 1 }, type: 'success' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

        it('Should delete fee which failed', function (done) {
            var stub = function fee() {};
            stub.prototype.checkCode = function (code) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Fee = proxyquire('../../server/controllers/fee',
                {'../objects/fee': stub});
            var req = { params: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Fee.checkCode(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });

    });
});

