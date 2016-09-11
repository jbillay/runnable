/**
 * Created by jeremy on 11/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Page = require('../../server/controllers/page');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of page controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of page controller is over !');
    });

    describe('Test save', function () {
        it('Should save a page with success', function (done) {
            var stub = function page() {};
            stub.prototype.save = function (values, callback) { return callback(null, {id: 1}); };
            var Page = proxyquire('../../server/controllers/page',
                {'../objects/page': stub});
            var req = { body: { title: 'toto' , content: 'toto', tag: 'toto', is_active: true }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Page.save(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'pageSaved', type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should save a page which failed', function (done) {
            var stub = function page() {};
            stub.prototype.save = function (values, callback) { return callback('Mock to fail', null); };
            var Page = proxyquire('../../server/controllers/page',
                {'../objects/page': stub});
            var req = { body: { title: 'toto' , content: 'toto', tag: 'toto', is_active: true }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Page.save(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'pageNotSaved', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getByTag', function () {
        it('Should get page by the tag with success', function (done) {
            var stub = function page() {};
            stub.prototype.getByTag = function (tag, callback) { return callback(null, {id: 1}); };
            var Page = proxyquire('../../server/controllers/page',
                {'../objects/page': stub});
            var req = { params: { tag: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Page.getByTag(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get page by the tag which failed', function (done) {
            var stub = function page() {};
            stub.prototype.getByTag = function (tag, callback) { return callback('Mock to fail', null); };
            var Page = proxyquire('../../server/controllers/page',
                {'../objects/page': stub});
            var req = { params: { tag: 'toto' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Page.getByTag(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test getList', function () {
        it('Should get list of pages with success', function (done) {
            var stub = function page() {};
            stub.prototype.getList = function (callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var Page = proxyquire('../../server/controllers/page',
                {'../objects/page': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Page.getList(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should get list of pages which failed', function (done) {
            var stub = function page() {};
            stub.prototype.getList = function (callback) { return callback('Mock to fail', null); };
            var Page = proxyquire('../../server/controllers/page',
                {'../objects/page': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Page.getList(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
});