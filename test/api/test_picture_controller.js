/**
 * Created by jeremy on 11/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Picture = require('../../server/controllers/picture');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of picture controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of picture controller is over !');
    });

    describe('Test get', function () {
        it('Should get a picture with success', function (done) {
            var stub = function picture() {};
            stub.prototype.retrieve = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.get(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {id: 1}, type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get a picture which failed', function (done) {
            var stub = function picture() {};
            stub.prototype.retrieve = function (id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.get(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getList', function () {
        it('Should get a list of picture with success', function (done) {
            var stub = function picture() {};
            stub.prototype.getList = function (id) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.getList(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get a list of picture which failed', function (done) {
            var stub = function picture() {};
            stub.prototype.getList = function (id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.getList(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test setDefault', function () {
        it('Should set a picture as default with success', function (done) {
            var stub = function picture() {};
            stub.prototype.setDefault = function (id, runId) { var deferred = q.defer(); assert.equal(id, 1); assert.equal(runId, 2); deferred.resolve({id: 1}); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1, runId: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.setDefault(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {id: 1}, type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should set a picture as default which failed', function (done) {
            var stub = function picture() {};
            stub.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1, runId: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.setDefault(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test remove', function () {
        it('Should remove a picture with success', function (done) {
            var stub = function picture() {};
            stub.prototype.remove = function (id) { var deferred = q.defer(); assert.equal(id, 1); deferred.resolve({result: 'ok'}); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.remove(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {result: 'ok'}, type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should remove a picture with error', function (done) {
            var stub = function picture() {};
            stub.prototype.remove = function (id) { var deferred = q.defer(); assert.equal(id, 1); deferred.resolve({result: 'ko'}); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.remove(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {result: 'ko'}, type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should remove a picture which failed', function (done) {
            var stub = function picture() {};
            stub.prototype.remove = function (id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.remove(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'runPictureNotRemove', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test add', function () {
        it('Should add a picture with success', function (done) {
            var stub = function picture() {};
            stub.prototype.create = function (path, runId) { var deferred = q.defer(); assert.equal(path, 'toto'); assert.equal(runId, 1); deferred.resolve({result: 'ok'}); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { files: { file: [ { path: 'toto' } ] },
                        params: { runId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.add(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: {result: 'ok'}, type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should add no file with error', function (done) {
            var stub = function picture() {};
            stub.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.resolve({result: 'ko'}); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { params: { id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.add(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'runPictureNotSaved', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should add a picture which failed', function (done) {
            var stub = function picture() {};
            stub.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Picture = proxyquire('../../server/controllers/picture',
                {'../objects/picture': stub});
            var req = { files: { file: [ { path: 'toto' } ] },
                    params: { runId: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Picture.add(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'runPictureNotSaved', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
});