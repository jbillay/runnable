/**
 * Created by jeremy on 11/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Options = require('../../server/controllers/option');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of option controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of option controller is over !');
    });

    describe('Test getOption', function () {
        it('Should get value for an option with success', function (done) {
            var stub = function Options() {};
            stub.prototype.get = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Options = proxyquire('../../server/controllers/option',
                {'../objects/option': stub});
            var req = { params: { name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Options.getOption(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get value for an option which failed', function (done) {
            var stub = function Options() {};
            stub.prototype.get = function (name) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Options = proxyquire('../../server/controllers/option',
                {'../objects/option': stub});
            var req = { params: { name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Options.getOption(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getOptions', function () {
        it('Should get all option values with success', function (done) {
            var stub = function Options() {};
            stub.prototype.load = function (callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Options = proxyquire('../../server/controllers/option',
                {'../objects/option': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Options.getOptions(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get all option values which failed', function (done) {
            var stub = function Options() {};
            stub.prototype.load = function (callback) { return callback('Mock to fail', null); };
            var Options = proxyquire('../../server/controllers/option',
                {'../objects/option': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Options.getOptions(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test saveOptions', function () {
        it('Should save option values with success', function (done) {
            var stub = function Options() {};
            stub.prototype.save = function (values, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Options = proxyquire('../../server/controllers/option',
                {'../objects/option': stub});
            var req = { body: { emailTemplate: 'toto' , mailConfig: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Options.saveOptions(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'emailOptionsSaved', type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should save option values which failed', function (done) {
            var stub = function Options() {};
            stub.prototype.save = function (values, callback) { return callback('Mock to fail', null); };
            var Options = proxyquire('../../server/controllers/option',
                {'../objects/option': stub});
            var req = { body: { emailTemplate: 'toto' , mailConfig: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Options.saveOptions(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'emailOptionsNotSaved', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
});