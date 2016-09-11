/**
 * Created by jeremy on 12/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Run = require('../../server/controllers/run');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of run controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of run controller is over !');
    });

    describe('Test create', function () {
        it('Should create a run without images with success', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 1}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1, name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.create(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runCreated', type: 'success', run: {id: 1}}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should create a run without images with success', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return {msg: 'At least one of the mandatory fields is missing (name, type, address_start, date_start)', type: 'error'}; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 1}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1, name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.create(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(400, {msg: 'At least one of the mandatory fields is missing (name, type, address_start, date_start)', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should create a run with failed as user is not authorized', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return {msg: 'Valid object', type: 'success'}; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback ('Not authorized', null); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1, name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.create(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(401, {msg: 'Not authorized', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should create a run with failed due to internal system error', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return {msg: 'Valid object', type: 'success'}; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback ('Mock to fail', null); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1, name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.create(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(500, {msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should create a run with images with success', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { body: { id: 1, name: 'toto' },
                        files: { file: [
                            {originalFilename: 'logo', path: 'toto'},
                            {originalFilename: 'pictures', path: 'titi'}
                        ]}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.create(req, res);
            setTimeout(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runCreated', type: 'success', run: {id: 2}}).calledOnce);
                res.jsonp.restore();
                return done();
            }, 5);
        });
        it('Should create a run with images but logo will not set as default', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { body: { id: 1, name: 'toto' },
                        files: { file: [
                            {originalFilename: 'logo', path: 'toto'},
                            {originalFilename: 'pictures', path: 'titi'}
                        ]}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.create(req, res);
            setTimeout(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runCreated', type: 'success', run: {id: 2}}).calledOnce);
                res.jsonp.restore();
                return done();
            }, 5);
        });
        it('Should create a run with images but will not be able to save images', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { body: { id: 1, name: 'toto' },
                        files: { file: [
                            {originalFilename: 'logo', path: 'toto'},
                            {originalFilename: 'pictures', path: 'titi'}
                        ]}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.create(req, res);
            setTimeout(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runCreated', type: 'success', run: {id: 2}}).calledOnce);
                res.jsonp.restore();
                return done();
            }, 5);
        });
        it('Should create a run with images but image not be pushed in the upload queue', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var stubAsync = { queue: function () { return {
                                push: function (option, callback) { return callback('Mock to fail', null); },
                                drain: function () { }  }; } };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture, 'async': stubAsync});
            var req = { body: { id: 1, name: 'toto' },
                        files: { file: [
                            {originalFilename: 'logo', path: 'toto'},
                            {originalFilename: 'pictures', path: 'titi'}
                        ]}},
                res = { jsonp: function (ret) { return ret; } };
            Run.create(req, res);
            return done();
        });
    });
    describe('Test search', function () {
        it('Should search for a run with success', function (done) {
            var stub = function run() {};
            stub.prototype.search = function (obj, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { body: { name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.search(req, res);
            assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should search for a run which failed', function (done) {
            var stub = function run() {};
            stub.prototype.search = function (obj, callback) { return callback('Mock to fail', null); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { body: { name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.search(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test activeList', function () {
        it('Should get active list of runs with success', function (done) {
            var stub = function run() {};
            stub.prototype.getActiveList = function (callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { body: { name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.activeList(req, res);
            assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get active list of runs which failed', function (done) {
            var stub = function run() {};
            stub.prototype.getActiveList = function (callback) { return callback('Mock to fail', null); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { body: { name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.activeList(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test detail', function () {
        it('Should get detail on a run with success', function (done) {
            var stub = function run() {};
            stub.prototype.getById = function (id, callback) { return callback(null, {id: 1}); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { params: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.detail(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get detail on a run which failed', function (done) {
            var stub = function run() {};
            stub.prototype.getById = function (id, callback) { return callback('Mock to fail', null); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { params: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.detail(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test next', function () {
        it('Should get list of next runs with success', function (done) {
            var stub = function run() {};
            stub.prototype.getNextList = function (nb, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { params: { nb: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.next(req, res);
            assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of next runs which failed', function (done) {
            var stub = function run() {};
            stub.prototype.getNextList = function (nb, callback) { return callback('Mock to fail', null); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { params: { nb: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.next(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test list', function () {
        it('Should get list of runs with success', function (done) {
            var stub = function run() {};
            stub.prototype.getList = function (old, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.list(req, res);
            assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of runs which failed', function (done) {
            var stub = function run() {};
            stub.prototype.getList = function (old, callback) { return callback('Mock to fail', null); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.list(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test toggleActive', function () {
        it('Should toggle a run between active and inactive with success', function (done) {
            var stub = function run() {};
            stub.prototype.toggleActive = function (id, callback) { return callback(null, {id: 1}); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { body: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.toggleActive(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'done', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should toggle a run between active and inactive which failed', function (done) {
            var stub = function run() {};
            stub.prototype.toggleActive = function (id, callback) { return callback('Mock to fail', null); };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stub});
            var req = { body: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.toggleActive(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test update', function () {
        it('Should update a run without images with success', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return {msg: 'Valid object', type: 'success'}; };
            stubRun.prototype.save = function (run, user, partner, callback) {  return callback (null, {id: 1}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.removeForRun = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1 }},
                res = { jsonp: function (status, ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.update(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runUpdated', type: 'success', run: { id: '1' }}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should update a run without images with success but with missing fields', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return {msg: 'At least one of the mandatory fields is missing (name, type, address_start, date_start)', type: 'error'}; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 1}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.removeForRun = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1, name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.update(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(400, {msg: 'At least one of the mandatory fields is missing (name, type, address_start, date_start)', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should update a run with failed as user is not authorized', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return {msg: 'Valid object', type: 'success'}; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback ('Not authorized', null); };
            var stubPicture = function picture() {};
            stubPicture.prototype.removeForRun = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1, name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.update(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(401, {msg: 'Not authorized', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should update a run with failed due to internal system error', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return {msg: 'Valid object', type: 'success'}; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback ('Mock to fail', null); };
            var stubPicture = function picture() {};
            stubPicture.prototype.removeForRun = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.create = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (name) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { fields: { id: 1, name: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.update(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(500, {msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should update a run with images with success', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.removeForRun = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { body: { id: 1, name: 'toto' },
                    files: { file: [
                        {originalFilename: 'logo', path: 'toto'},
                        {originalFilename: 'pictures', path: 'titi'}
                    ]}},
                res = { jsonp: function (status, ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.update(req, res);
            setTimeout(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runUpdated', type: 'success', run: { id: 1, name: 'toto' }}).calledOnce);
                res.jsonp.restore();
                return done();
            }, 5);
        });
        it('Should update a run with images but logo will not set as default', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.removeForRun = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { body: { id: 1, name: 'toto' },
                    files: { file: [
                        {originalFilename: 'logo', path: 'toto'},
                        {originalFilename: 'pictures', path: 'titi'}
                    ]}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.update(req, res);
            setTimeout(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runUpdated', type: 'success', run: { id: 1, name: 'toto' }}).calledOnce);
                res.jsonp.restore();
                return done();
            }, 5);
        });
        it('Should update a run with images but will not be able to save images', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.removeForRun = function (id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture});
            var req = { body: { id: 1, name: 'toto' },
                    files: { file: [
                        {originalFilename: 'logo', path: 'toto'},
                        {originalFilename: 'pictures', path: 'titi'}
                    ]}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Run.update(req, res);
            setTimeout(function () {
                assert.isTrue(spyRes.withArgs(201, {msg: 'runUpdated', type: 'success', run: { id: 1, name: 'toto' }}).calledOnce);
                res.jsonp.restore();
                return done();
            }, 5);
        });
        it('Should update a run with images but image not be pushed in the upload queue', function (done) {
            var stubRun = function run() {};
            stubRun.prototype.checkRunObject = function (obj) { return { type: 'success' }; };
            stubRun.prototype.save = function (run, user, partner, callback) { return callback (null, {id: 2}); };
            var stubPicture = function picture() {};
            stubPicture.prototype.create = function (path, runId) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            stubPicture.prototype.setDefault = function (id, runId) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var stubAsync = { queue: function () { return {
                push: function (option, callback) { return callback('Mock to fail', null); },
                drain: function () { }  }; } };
            var Run = proxyquire('../../server/controllers/run',
                {'../objects/run': stubRun, '../objects/picture': stubPicture, 'async': stubAsync});
            var req = { body: { id: 1, name: 'toto' },
                    files: { file: [
                        {originalFilename: 'logo', path: 'toto'},
                        {originalFilename: 'pictures', path: 'titi'}
                    ]}},
                res = { jsonp: function (ret) { return ret; } };
            Run.update(req, res);
            return done();
        });
    });
});