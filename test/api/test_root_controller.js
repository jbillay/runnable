/**
 * Created by jeremy on 12/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Root = require('../../server/controllers/root');
var Auth = require('../../server/authorization');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of root controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of root controller is over !');
    });

    describe('Test sync', function () {
        it('Should sync database with success', function (done) {
            var stub = { sequelize: { sync: function (obj) { var deferred = q.defer(); deferred.resolve('toto'); return deferred.promise; } } };
            var Root = proxyquire('../../server/controllers/root',
                {'../models': stub});
            var req = {},
                res = { redirect: function (path) { return path; } };
            var spyRes = sinon.spy(res, 'redirect');
            Root.sync(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs('/').calledOnce);
                res.redirect.restore();
                return done();
            });
        });
        it('Should sync database which failed', function (done) {
            var stub = { sequelize: { sync: function (obj) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
            var Root = proxyquire('../../server/controllers/root',
                {'../models': stub});
            var req = {},
                res = { redirect: function (path) { return path; } };
            var spyRes = sinon.spy(res, 'redirect');
            Root.sync(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs('/').calledOnce);
                res.redirect.restore();
                return done();
            });
        });
    });
    describe('Test version', function () {
        it('Should get version of MRT with success', function (done) {
            var stub = { readFile: function (path, coding, callback) { return callback(null, 'toto'); } };
            var Root = proxyquire('../../server/controllers/root',
                {'fs': stub});
            var req = {},
                res = { json: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'json');
            Root.version(req, res);
            assert.isTrue(spyRes.withArgs('toto').calledOnce);
            res.json.restore();
            return done();
        });
        it('Should get version of MRT which failed', function (done) {
            var stub = { readFile: function (path, coding, callback) { return callback('Mock to fail', null); } };
            var Root = proxyquire('../../server/controllers/root',
                {'fs': stub});
            var req = {},
                res = { json: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'json');
            Root.version(req, res);
            assert.isTrue(spyRes.withArgs('Version not defined').calledOnce);
            res.json.restore();
            return done();
        });
    });
    describe('Test sendTestMail', function () {
        it('Should send a test email with success', function (done) {
            var stub = function mail() {};
            stub.prototype.sendEmail = function (templateName, values, email) {
                    var deferred = q.defer(); assert.equal(templateName, 'mailTest'); assert.deepEqual(values, {}); assert.equal(email, 'jbillay@gmail.com'); deferred.resolve('toto'); return deferred.promise; };
            var Root = proxyquire('../../server/controllers/root',
                {'../objects/mail': stub});
            var req = { body: {template: { } } },
                res = { jsonp: function (path) { return path; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Root.sendTestMail(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'toto', type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test requireAdmin', function () {
        it('Should check if current user is an admin user', function (done) {
            var req = { isAuthenticated: function () { return true; },
                        user: { role: 'admin' } },
                res = { jsonp: function (path) { return path; },
                        cookie: function (user, options) { return user; } };
            var spyRes = sinon.spy(res, 'cookie');
            var spyNext = sinon.spy();
            Auth.requireAdmin(req, res, spyNext);
            assert.isTrue(spyNext.calledOnce);
            res.cookie.restore();
            return done();
        });
        it('Should check if current user is an admin user for a non admin', function (done) {
            var req = { isAuthenticated: function () { return true; },
                        user: { role: 'user' } },
                res = { jsonp: function (path) { return path; },
                        send: function (status, ret) { return ret; } };
            var spyRes = sinon.spy(res, 'send');
            var spyNext = sinon.spy();
            Auth.requireAdmin(req, res, spyNext);
            assert.isTrue(spyNext.notCalled);
            assert.isTrue(spyRes.withArgs(401, { msg: 'notAuthorized', type: 'error' }).calledOnce);
            res.send.restore();
            return done();
        });
        it('Should check if current user is an admin user for a non authenticate user', function (done) {
            var req = { isAuthenticated: function () { return false; },
                        user: { } },
                res = { jsonp: function (path) { return path; },
                        send: function (status, ret) { return ret; } };
            var spyRes = sinon.spy(res, 'send');
            var spyNext = sinon.spy();
            Auth.requireAdmin(req, res, spyNext);
            assert.isTrue(spyNext.notCalled);
            assert.isTrue(spyRes.withArgs(401, { msg: 'notAuthenticated', type: 'error' }).calledOnce);
            res.send.restore();
            return done();
        });
    });
});