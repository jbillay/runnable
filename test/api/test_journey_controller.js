/**
 * Created by jeremy on 11/08/2016.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Journey = require('../../server/controllers/journey');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of journey controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of journey controller is over !');
    });

    describe('Test create', function () {
        it('Should create a journey for an authenticate user with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.draft = function (journey, callback) { callback(null, {id: 1, Run: {id: 1}}); };
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback(null, {id: 1, Run: {id: 1}}, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 } } },
                        user: { id: 1 },
                        isAuthenticated: function () { return true; }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.create(req, res, spyNext);
            assert.isTrue(spyRes.withArgs(201, {msg: 'journeyCreated', type: 'success', journey: {id: 1, Run: {id: 1}}}).calledOnce);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.draft, 0);
            assert.equal(req.Run.id, 1);
            assert.equal(req.Journey.id, 1);
            res.jsonp.restore();
            return done();
        });
        it('Should create a journey for an authenticate user which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.draft = function (journey, callback) { callback('Mock to fail', null); };
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback('Mock to fail', null, null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 } } },
                        user: { id: 1 },
                        isAuthenticated: function () { return true; }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.create(req, res, spyNext);
            assert.isTrue(spyRes.withArgs(500, {msg: 'journeyNotCreated', type: 'error'}).calledOnce);
            assert.isTrue(spyNext.notCalled);
            assert.equal(req.draft, 0);
            assert.equal(req.Run.id, 1);
            assert.isUndefined(req.Journey);
            res.jsonp.restore();
            return done();
        });
        it('Should create a journey for non authenticate user with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.draft = function (journey, callback) { callback(null, {id: 1, Run: {id: 1}}); };
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback(null, {id: 1, Run: {id: 1}}, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 } } },
                        user: { id: 1 },
                        isAuthenticated: function () { return false; }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.create(req, res, spyNext);
            assert.isTrue(spyRes.withArgs(201, {msg: 'draftJourneyCreated', type: 'success', journeyKey: {id: 1, Run: {id: 1}}}).calledOnce);
            assert.isTrue(spyNext.notCalled);
            assert.equal(req.draft, 1);
            assert.equal(req.Run.id, 1);
            assert.isUndefined(req.Journey);
            res.jsonp.restore();
            return done();
        });
        it('Should create a journey for non authenticate user which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.draft = function (journey, callback) { callback('Mock to fail', null); };
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback('Mock to fail', null, null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 } } },
                        user: { id: 1 },
                        isAuthenticated: function () { return false; }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.create(req, res, spyNext);
            assert.isTrue(spyRes.withArgs(500, {msg: 'draftJourneyNotCreated', type: 'error'}).calledOnce);
            assert.isTrue(spyNext.notCalled);
            assert.equal(req.draft, 1);
            assert.equal(req.Run.id, 1);
            assert.isUndefined(req.Journey);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test confirm', function () {
        it('Should confirm a draft journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.saveDraft = function (journey, user, callback) { callback(null, {id: 1, Run: {id: 1}}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { key:  'toto' },
                    user: { id: 1 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.confirm(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'draftJourneySaved', type: 'success', journey: {id: 1, Run: {id: 1}}}).calledOnce);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.Run.id, 1);
            assert.equal(req.Journey.id, 1);
            res.jsonp.restore();
            return done();
        });
        it('Should confirm a draft journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.saveDraft = function (journey, user, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { key:  'toto' },
                    user: { id: 1 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.confirm(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'draftJourneyNotSaved', type: 'error'}).calledOnce);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.Run);
            assert.isUndefined(req.Journey);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test update', function () {
        it('Should update journey by user owning the journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback(null, {id: 1, Run: {id: 1}}, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 }, UserId: 1 } },
                    user: { id: 1, role: 'user' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.update(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'journeyUpdated', type: 'success'}).calledOnce);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.Run.id, 1);
            assert.equal(req.Journey.id, 1);
            res.jsonp.restore();
            return done();
        });
        it('Should update journey by user owning the journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback('Mock to fail', null, null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 }, UserId: 1 } },
                    user: { id: 1, role: 'user' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.update(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'journeyNotUpdated', type: 'error'}).calledOnce);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.Run);
            assert.isUndefined(req.Journey);
            res.jsonp.restore();
            return done();
        });
        it('Should update journey by admin with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback(null, {id: 1, Run: {id: 1}}, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 }, UserId: 2 } },
                    user: { id: 1, role: 'admin' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.update(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'journeyUpdated', type: 'success'}).calledOnce);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.Run.id, 1);
            assert.equal(req.Journey.id, 1);
            res.jsonp.restore();
            return done();
        });
        it('Should update journey by user not owning the journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.save = function (journey, userId, userRole, callback) { callback(null, {id: 1, Run: {id: 1}}, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: { journey:  { id: 1, Run: { id: 1 }, UserId: 2 } },
                    user: { id: 1, role: 'user' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            var spyNext = sinon.spy();
            Journey.update(req, res, spyNext);
            assert.isTrue(spyRes.withArgs({msg: 'notAllowToUpdate', type: 'error'}).calledOnce);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.Run);
            assert.isUndefined(req.Journey);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test list', function () {
        it('Should get list of journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getList = function (old, callback) { callback(null, [{id: 1}]); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.list(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getList = function (old, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.list(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test openList', function () {
        it('Should get list of open journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getOpenList = function (callback) { callback(null, [{id: 1}]); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.openList(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of open journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getOpenList = function (callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.openList(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test listForRun', function () {
        it('Should get list of journey for a run with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getListForRun = function (id, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.listForRun(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of journey for a run which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getListForRun = function (id, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.listForRun(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test detail', function () {
        it('Should get detail of a journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getById = function (id, callback) { callback(null, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.detail(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get detail of a journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getById = function (id, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.detail(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test next', function () {
        it('Should get list of next journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getNextList = function (id, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {nb: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.next(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of next journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getNextList = function (id, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {nb: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.next(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test bookSpace', function () {
        it('Should get booked spaces for a journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getBookSpace = function (id, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {id: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.bookSpace(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get booked spaces for a journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.getBookSpace = function (id, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { params: {id: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.bookSpace(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test togglePayed', function () {
        it('Should mark a journey as payed with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.togglePayed = function (id, callback) { callback(null, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: {id: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.togglePayed(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'journeyTogglePayed', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should mark a journey as payed which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.togglePayed = function (id, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: {id: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.togglePayed(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'journeyNotTogglePayed', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test cancel', function () {
        it('Should cancel a journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.cancel = function (id, callback) { callback(null, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: {id: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.cancel(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'journeyCanceled', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should cancel a journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.cancel = function (id, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { body: {id: 2} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.cancel(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'journeyNotCanceled', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test notifyJoin', function () {
        it('Should mark a journey as payed with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.notifyJoin = function (invoice, callback) { callback(null, {id: 1}); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { invoice: {id: 2} },
                res = {};
            Journey.notifyJoin(req, res);
            return done();
        });
        it('Should mark a journey as payed which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.notifyJoin = function (invoice, callback) { callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { invoice: {id: 2} },
                res = {};
            Journey.notifyJoin(req, res);
            return done();
        });
    });
    describe('Test toPay', function () {
        it('Should get list of journey to pay with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.toPay = function () { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.toPay(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: [{id: 1}, {id: 2}], type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get list of journey to pay which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.toPay = function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Journey.toPay(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test notifyJoinedModification', function () {
        it('Should notify modification of a journey with success', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.notifyJoinedModification = function (journey, run, callback) { return callback(null, 'OK'); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { Journey: 1, Run: 1 },
                res = { send: function (status) { return status; } };
            var spyRes = sinon.spy(res, 'send');
            Journey.notifyJoinedModification(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(200).calledOnce);
                res.send.restore();
                return done();
            });
        });
        it('Should notify modification of a journey which failed', function (done) {
            var stubJourney = function journey() {};
            stubJourney.prototype.notifyJoinedModification = function (journey, run, callback) { return callback('Mock to fail', null); };
            var Journey = proxyquire('../../server/controllers/journey',
                {'../objects/journey': stubJourney});
            var req = { Journey: 1, Run: 1 },
                res = { send: function (status) { return status; } };
            var spyRes = sinon.spy(res, 'send');
            Journey.notifyJoinedModification(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(401).calledOnce);
                res.send.restore();
                return done();
            });
        });
    });
});