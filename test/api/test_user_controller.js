/**
 * Created by jeremy on 12/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var User = require('../../server/controllers/user');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of user controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of user controller is over !');
    });

    describe('Test remove', function () {
        it('Should remove a user account with success', function (done) {
            var stub = function user() {};
            stub.prototype.delete = function (id, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.remove(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'userDeleted', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should remove a user account which failed', function (done) {
            var stub = function user() {};
            stub.prototype.delete = function (id, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.remove(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'userNotDeleted', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test invite', function () {
        it('Should invite user friends with success', function (done) {
            var stubMail = function mail() {};
            stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
            stubMail.prototype.setTo = function(mail) { return mail; };
            stubMail.prototype.setSubject = function(subject) { return subject; };
            stubMail.prototype.setContentHtml = function(content) { return content; };
            stubMail.prototype.setText = function(text) { return text; };
            stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/mail': stubMail});
            var req = { body: { emails: 'jbillay@gmail.com, richard.couret@free.fr' }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.invite(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({ msg: 'Invitation(s) envoyée(s)' }).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test update', function () {
        it('Should update a user account with success', function (done) {
            var stub = function user() {};
            stub.prototype.update = function (user, info, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { id: 2 },
                        user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.update(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'accountUpdated', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should update a user account which failed', function (done) {
            var stub = function user() {};
            stub.prototype.update = function (user, info, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { id: 2 },
                        user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.update(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'notUpdatedAccount', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test create', function () {
        it('Should create a user account with success', function (done) {
            var stubUser = function user() {};
            stubUser.prototype.set = function (info) { return info; };
            stubUser.prototype.save = function (callback) { return callback(null, {id: 1}); };
            stubUser.prototype.getItraCode = function (user, callback) { return callback(null, {id: 1}); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, value, email) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var stubJWT = { sign: function (user, secret, options) { return 'TOTO'; } };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stubUser, '../objects/mail': stubMail, 'jsonwebtoken': stubJWT});
            var req = { body: { email: 'jbillay@gmail.com', password: 'noofs', password_confirmation: 'noofs' },
                    user: { id: 1 },
                    logIn: function (user, callback) { return callback(null); }},
                res = { jsonp: function (status, ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.create(req, res);
            var expire = new Date().getTime() + 86400;
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(201).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should create a user account with success but itra fail', function (done) {
            var stubUser = function user() {};
            stubUser.prototype.set = function (info) { return info; };
            stubUser.prototype.save = function (callback) { return callback(null, {id: 1}); };
            stubUser.prototype.getItraCode = function (user, callback) { return callback('Mock to fail', null); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, value, email) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var stubJWT = { sign: function (user, secret, options) { return 'TOTO'; } };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stubUser, '../objects/mail': stubMail, 'jsonwebtoken': stubJWT});
            var req = { body: { email: 'jbillay@gmail.com', password: 'noofs', password_confirmation: 'noofs' },
                    user: { id: 1 },
                    logIn: function (user, callback) { return callback(null); }},
                res = { jsonp: function (status, ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.create(req, res);
            var expire = new Date().getTime() + 86400;
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(201).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should create a user account with success but user not able to log in', function (done) {
            var stubUser = function user() {};
            stubUser.prototype.set = function (info) { return info; };
            stubUser.prototype.save = function (callback) { return callback(null, {id: 1}); };
            stubUser.prototype.getItraCode = function (user, callback) { return callback(null, {id: 1}); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, value, email) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var stubJWT = { sign: function (user, secret, options) { return 'TOTO'; } };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stubUser, '../objects/mail': stubMail, 'jsonwebtoken': stubJWT});
            var req = { body: { email: 'jbillay@gmail.com', password: 'noofs', password_confirmation: 'noofs' },
                    user: { id: 1 },
                    logIn: function (user, callback) { return callback('Mokc to fail'); }},
                res = { jsonp: function (status, ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.create(req, res);
            var expire = new Date().getTime() + 86400;
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs(201).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test showRuns', function () {
        it('Should get user runs on ITRA with success', function (done) {
            var stub = function user() {};
            stub.prototype.getRuns = function (user, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.showRuns(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get user runs on ITRA which failed', function (done) {
            var stub = function user() {};
            stub.prototype.getRuns = function (user, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.showRuns(req, res);
            assert.isTrue(spyRes.withArgs('Impossible de récupérer les informations sur le site i-tra.org').calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test showJourneys', function () {
        it('Should get journeys of a user with success', function (done) {
            var stub = function journey() {};
            stub.prototype.getByUser = function (user, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/journey': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.showJourneys(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get journeys of a user which failed', function (done) {
            var stub = function journey() {};
            stub.prototype.getByUser = function (user, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/journey': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.showJourneys(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Not able to get user journey', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test showJoins', function () {
        it('Should get joins of a user with success', function (done) {
            var stub = function join() {};
            stub.prototype.getByUser = function (user, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/join': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.showJoins(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get joins of a user which failed', function (done) {
            var stub = function join() {};
            stub.prototype.getByUser = function (user, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/join': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.showJoins(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test resetPassword', function () {
        it('Should reset user password with success', function (done) {
            var stubUser = function user() {};
            stubUser.prototype.updatePassword = function (email, password, callback) { return callback(null, {id: 1}); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, values, email) { var deferred = q.defer(); deferred.resolve('Email sent'); return deferred.promise; };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stubUser, '../objects/mail': stubMail});
            var req = { body: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.resetPassword(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'passwordReset', type: 'success'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should reset user password which failed', function (done) {
            var stubUser = function user() {};
            stubUser.prototype.updatePassword = function (email, password, callback) { return callback('Mock to fail', null); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, values, email) { var deferred = q.defer(); deferred.resolve('Email sent'); return deferred.promise; };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stubUser, '../objects/mail': stubMail});
            var req = { body: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.resetPassword(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'passwordNotReset', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
        it('Should reset user password with success but fail to send email', function (done) {
            var stubUser = function user() {};
            stubUser.prototype.updatePassword = function (email, password, callback) { return callback(null, {id: 1}); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, values, email) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stubUser, '../objects/mail': stubMail});
            var req = { body: { id: 2 }},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.resetPassword(req, res);
            process.nextTick(function () {
                assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
                res.jsonp.restore();
                return done();
            });
        });
    });
    describe('Test updatePassword', function () {
        it('Should update user password with success', function (done) {
            var stub = function user() {};
            var currentUser = { authenticate: function (password) { return true; } };
            stub.prototype.getByEmail = function (id, callback) { return callback(null, currentUser); };
            stub.prototype.updatePassword = function (email, password, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { passwords: { old: 'noofs', new: 'edgar', newConfirm: 'edgar'} },
                        user: { email: 'jbillay@gmail.com' } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.updatePassword(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'passwordUpdated', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should update user password which fail to update password', function (done) {
            var stub = function user() {};
            var currentUser = { authenticate: function (password) { return true; } };
            stub.prototype.getByEmail = function (id, callback) { return callback(null, currentUser); };
            stub.prototype.updatePassword = function (email, password, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { passwords: { old: 'noofs', new: 'edgar', newConfirm: 'edgar'} },
                        user: { email: 'jbillay@gmail.com' } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.updatePassword(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should update password for a unknown user which failed', function (done) {
            var stub = function user() {};
            stub.prototype.getByEmail = function (id, callback) { return callback(null, null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { passwords: { old: 'noofs', new: 'edgar', newConfirm: 'edgar'} },
                        user: { email: 'jbillay@gmail.com' } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.updatePassword(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'userUnknow', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should update user password with wrong old password which fail', function (done) {
            var stub = function user() {};
            var currentUser = { authenticate: function (password) { return false; } };
            stub.prototype.getByEmail = function (id, callback) { return callback(null, currentUser); };
            stub.prototype.updatePassword = function (email, password, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { passwords: { old: 'noofs', new: 'edgar', newConfirm: 'edgar'} },
                        user: { email: 'jbillay@gmail.com' } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.updatePassword(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'passwordWrong', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should update user password with different new password which fail', function (done) {
            var stub = function user() {};
            var currentUser = { authenticate: function (password) { return true; } };
            stub.prototype.getByEmail = function (id, callback) { return callback(null, currentUser); };
            stub.prototype.updatePassword = function (email, password, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { passwords: { old: 'noofs', new: 'edgar', newConfirm: 'toto'} },
                        user: { email: 'jbillay@gmail.com' } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.updatePassword(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'passwordDifferent', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should update user password which fail to update password', function (done) {
            var stub = function user() {};
            var currentUser = { authenticate: function (password) { return true; } };
            stub.prototype.getByEmail = function (id, callback) { return callback(null, currentUser); };
            stub.prototype.updatePassword = function (email, password, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { passwords: { old: 'noofs', new: 'edgar', newConfirm: 'edgar'} },
                        user: { email: 'jbillay@gmail.com' } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.updatePassword(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should update password but fail to get user', function (done) {
            var stub = function user() {};
            stub.prototype.getByEmail = function (id, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: { passwords: { old: 'noofs', new: 'edgar', newConfirm: 'edgar'} },
                        user: { email: 'jbillay@gmail.com' } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.updatePassword(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test list', function () {
        it('Should get list of user with success', function (done) {
            var stub = function user() {};
            stub.prototype.getList = function (callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.list(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get list of user which failed', function (done) {
            var stub = function user() {};
            stub.prototype.getList = function (callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.list(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test toggleActive', function () {
        it('Should toggle user as active with success', function (done) {
            var stub = function user() {};
            stub.prototype.toggleActive = function (id, callback) { return callback(null, [{id: 1}, {id: 2}]); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.toggleActive(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'userToggleActive', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should toggle user as active which failed', function (done) {
            var stub = function user() {};
            stub.prototype.toggleActive = function (id, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { body: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.toggleActive(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test active', function () {
        it('Should active a user account with success', function (done) {
            var stub = function user() {};
            stub.prototype.activate = function (id, hash, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { params: { id: 1, hash: 'qskjdlqsdqlskd' } },
                res = { redirect: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'redirect');
            User.active(req, res);
            assert.isTrue(spyRes.withArgs('/').calledOnce);
            res.redirect.restore();
            return done();
        });
    });
    describe('Test publicInfo', function () {
        it('Should get user public info with success', function (done) {
            var stub = function user() {};
            stub.prototype.getPublicInfo = function (id, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.publicInfo(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get user public info which failed', function (done) {
            var stub = function user() {};
            stub.prototype.getPublicInfo = function (id, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.publicInfo(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test publicDriverInfo', function () {
        it('Should get user driver info with success', function (done) {
            var stub = function user() {};
            stub.prototype.getPublicDriverInfo = function (id, callback) { return callback(null, {id: 1}); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.publicDriverInfo(req, res);
            assert.isTrue(spyRes.withArgs({id: 1}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should get user driver info which failed', function (done) {
            var stub = function user() {};
            stub.prototype.getPublicDriverInfo = function (id, callback) { return callback('Mock to fail', null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { params: {id: 1} },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.publicDriverInfo(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test uploadPicture', function () {
        it('Should upload picture for a user with success', function (done) {
            var stub = function user() {};
            stub.prototype.addPicture = function (id, path, callback) { return callback(null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { files: {file: [ { path: 'toto' } ] },
                        user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.uploadPicture(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'userPictureSaved', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should upload picture for a user which fail', function (done) {
            var stub = function user() {};
            stub.prototype.addPicture = function (id, path, callback) { return callback('Mock to fail'); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { files: {file: [ { path: 'toto' } ] },
                        user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.uploadPicture(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should upload picture for a user which fail as no file defined', function (done) {
            var stub = function user() {};
            stub.prototype.addPicture = function (id, path, callback) { return callback(null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.uploadPicture(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'userPictureNotSaved', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test deletePicture', function () {
        it('Should delete picture for a user with success', function (done) {
            var stub = function user() {};
            stub.prototype.deletePicture = function (id, callback) { return callback(null); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.deletePicture(req, res);
            assert.isTrue(spyRes.withArgs({msg:'userPictureRemoved', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should delete picture for a user which fail', function (done) {
            var stub = function user() {};
            stub.prototype.deletePicture = function (id, callback) { return callback('Mock to fail'); };
            var User = proxyquire('../../server/controllers/user',
                {'../objects/user': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            User.deletePicture(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
});
