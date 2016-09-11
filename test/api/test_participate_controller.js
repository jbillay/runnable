/**
 * Created by jeremy on 11/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Participate = require('../../server/controllers/participate');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of participate controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of participate controller is over !');
    });

    describe('Test add', function () {
        it('Should add a participation for a user with success', function (done) {
            var stub = function participate() {};
            stub.prototype.add = function (runId, user, callback) { return callback(null, {id: 1}); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { body: {runId: 1},
                        user: {id: 1}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Participate.add(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'addParticipate', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should add a participation for a user which failed', function (done) {
            var stub = function participate() {};
            stub.prototype.add = function (runId, user, callback) { return callback('Mock to fail', null); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { body: {runId: 1},
                    user: {id: 1}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Participate.add(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'notAbleParticipate', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test userList', function () {
        it('Should get runs followed by a user with success', function (done) {
            var stub = function participate() {};
            stub.prototype.userList = function (user, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { user: {id: 1}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Participate.userList(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get runs followed by a user which failed', function (done) {
            var stub = function participate() {};
            stub.prototype.userList = function (user, callback) { return callback('Mock to fail', null); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { user: {id: 1}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Participate.userList(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test userRunList', function () {
        it('Should get users who follow a run with success', function (done) {
            var stub = function participate() {};
            stub.prototype.userRunList = function (run, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { params: {id: 1}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Participate.userRunList(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get users who follow a run which failed', function (done) {
            var stub = function participate() {};
            stub.prototype.userRunList = function (run, callback) { return callback('Mock to fail', null); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { params: {id: 1}},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Participate.userRunList(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test notify', function () {
        it('Should notify user who follow a run with success', function (done) {
            var stub = function participate() {};
            stub.prototype.notify = function (run, journey, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { draft: 0,
                        Run: {id: 1},
                        Journey: {id: 1}},
                res = {};
            var spyNext = sinon.spy();
            Participate.notify(req, res, spyNext);
            assert.isTrue(spyNext.calledOnce);
            return done();
        });
        it('Should notify user who follow a run which failed', function (done) {
            var stub = function participate() {};
            stub.prototype.notify = function (run, journey, callback) { return callback('Mock to fail', null); };
            var Participate = proxyquire('../../server/controllers/participate',
                {'../objects/participate': stub});
            var req = { draft: 0,
                    Run: {id: 1},
                    Journey: {id: 1}},
                res = {};
            var spyNext = sinon.spy();
            Participate.notify(req, res, spyNext);
            assert.isTrue(spyNext.calledOnce);
            return done();
        });
    });
});