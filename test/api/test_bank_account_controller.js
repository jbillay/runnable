/**
 * Created by jeremy on 10/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var BankAccount = require('../../server/controllers/bank_account');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

describe('Test of bank_account controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of bank account controller is over !');
    });

    describe('Test Get bank account', function () {
        it('Should get a bank account with success', function (done) {
            var stub = function bankAccount() {};
            stub.prototype.getUserAccount = function (id, callback) { callback(null, {id: 1}); };
            var BankAccount = proxyquire('../../server/controllers/bank_account',
                {'../objects/bank_account': stub});
            var req = {
                    user: {
                        id: 1
                    }
                },
                res = {
                    jsonp: function (ret) { return ret; }
                };
            var spyRes = sinon.spy(res, 'jsonp');
            BankAccount.get(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get a bank account which failed', function (done) {
            var stub = function bankAccount() {};
            stub.prototype.getUserAccount = function (id, callback) { callback('Mock to fail', null); };
            var BankAccount = proxyquire('../../server/controllers/bank_account',
                {'../objects/bank_account': stub});
            var req = {
                    user: {
                        id: 1
                    }
                },
                res = {
                    jsonp: function (ret) { return ret; }
                };
            var spy = sinon.spy(res, 'jsonp');
            BankAccount.get(req, res);
            assert.isTrue(spy.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });

    describe('Test save a bank account', function () {
        it('Should save a bank account with success', function (done) {
            var stub = function bankAccount() {};
            stub.prototype.set = function (object) { return true; };
            stub.prototype.save = function (callback) { return callback(null, {id: 1}); };
            var BankAccount = proxyquire('../../server/controllers/bank_account',
                {'../objects/bank_account': stub});
            var req = {
                    body: {},
                    user: {
                        id: 1
                    }
                },
                res = {
                    jsonp: function (ret) { return ret; }
                };
            var spyRes = sinon.spy(res, 'jsonp');
            BankAccount.save(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'bankAccountSaved', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should save a bank account which failed', function (done) {
            var stub = function bankAccount() {};
            stub.prototype.set = function (object) { return true; };
            stub.prototype.save = function (callback) { return callback('Mock to fail', null); };
            var BankAccount = proxyquire('../../server/controllers/bank_account',
                {'../objects/bank_account': stub});
            var req = {
                    body: {},
                    user: {
                        id: 1
                    }
                },
                res = {
                    jsonp: function (ret) { return ret; }
                };
            var spy = sinon.spy(res, 'jsonp');
            BankAccount.save(req, res);
            assert.isTrue(spy.withArgs({msg: 'bankAccountNotSaved', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });

    describe('Test get user bank account', function () {
        it('Should get user bank account with success', function (done) {
            var stub = function bankAccount() {};
            stub.prototype.getUserAccount= function (id, callback) { return callback(null, {id: 1}); };
            var BankAccount = proxyquire('../../server/controllers/bank_account',
                {'../objects/bank_account': stub});
            var req = {
                    params: {
                        id: 1
                    }
                },
                res = {
                    jsonp: function (ret) { return ret; }
                };
            var spyRes = sinon.spy(res, 'jsonp');
            BankAccount.getByUser(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get user bank account which failed', function (done) {
            var stub = function bankAccount() {};
            stub.prototype.getUserAccount = function (id, callback) { return callback('Mock to fail', null); };
            var BankAccount = proxyquire('../../server/controllers/bank_account',
                {'../objects/bank_account': stub});
            var req = {
                    params: {
                        id: 1
                    }
                },
                res = {
                    jsonp: function (ret) { return ret; }
                };
            var spy = sinon.spy(res, 'jsonp');
            BankAccount.getByUser(req, res);
            assert.isTrue(spy.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
});
