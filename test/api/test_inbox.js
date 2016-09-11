/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Inbox = require('../../server/objects/inbox');
var Mail = require('../../server/objects/mail');
var settings = require('../../conf/config');
var sinon = require('sinon');
var q = require('q');
var proxyquire = require('proxyquire');

describe('Test of inbox object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of inbox over !');
    });

    describe('Test with local database', function () {
        it('Get nb unread message for a user', function (done) {
            var inbox = new Inbox();
            inbox.countUnread(2, function (err, nb) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(nb, 1);
                inbox.countUnread(-1, function (err, nb) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });

        it('Set a message as read', function (done) {
            var inbox = new Inbox();
            inbox.setIsRead(4, true, function (err, message) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(message.is_read, 1);
                inbox.countUnread(2, function (err, nb) {
                    assert.equal(nb, 0);
                    inbox.setIsRead(4, true, function (err, message) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });

        it('Get list of message for a user', function (done) {
            var inbox = new Inbox(),
                user = {
                   id: 2
                },
                user2 = {
                    id: -1
                };
            inbox.getList(user, function (err, messages) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(messages.length, 2);
                assert.equal(messages[0].title, 'Validation inscription au voyage pour la course Corrida de Saint Germain en Laye');
                inbox.getList(user2, function (err, messages) {
                    assert.isNotNull(err);
                    assert.isNull(messages);
                    return done();
                });
            });
        });

        it('Create a new Inbox message', function (done) {
            var inbox = new Inbox(),
                mail = new Mail(),
                template = 'inboxTest',
                values = {
                    message: 'message Inbox',
                    userId: 3
                },
                userId = 2,
                message = {
                    id: 5,
                    title: 'Test unitaire',
                    message: 'Test unitaire pour la création d un message',
                    is_read: 0,
                    userId: 1,
                    createdAt: '2015-02-05 23:41:54',
                    updatedAt: '2015-02-05 23:41:54'
                };
            sinon.spy(mail, 'send');
            sinon.spy(mail, 'setTo');
            sinon.spy(mail, 'generateContent');
            inbox.setMail(mail);
            inbox.set({});
            inbox.set(message);
            var tmp = inbox.get();
            assert.equal(tmp.title, 'Test unitaire');
            assert.equal(tmp.message, 'Test unitaire pour la création d un message');
            assert.equal(tmp.userId, 1);
            assert.equal(tmp.is_read, false);
            inbox.add(template, values, userId)
                .then(function (newMessage) {
                    assert.equal(newMessage.id, 5);
                    assert.equal(newMessage.title, 'Email pour 3');
                    assert.include(newMessage.message, 'TEST message Inbox');
                    assert.equal(newMessage.is_read, false);
                    assert.equal(newMessage.UserId, userId);
                    assert.isTrue(mail.send.calledOnce);
                    assert.isTrue(mail.generateContent.calledOnce);
                    assert.isTrue(mail.generateContent.calledWithExactly(template, values));
                    assert.isTrue(mail.setTo.calledOnce);
                    assert.isTrue(mail.setTo.calledWithExactly('richard.couret@free.fr'));
                    mail.send.restore();
                    mail.generateContent.restore();
                    mail.setTo.restore();
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Remove message 1', function (done) {
            var inbox = new Inbox(),
                user = {
                    id: 2
                };
            inbox.delete(1, function (err, toRemoveMsg) {
                if (err) return done(err);
                assert.equal(toRemoveMsg, 'messageDeleted');
                inbox.getList(user, function (err, messages) {
                    if (err) return done(err);
                    assert.equal(messages.length, 1);
                    assert.equal(messages[0].title, 'Validation inscription au voyage pour la course Corrida de Saint Germain en Laye');
                    return done();
                });
            });
        });
    });
    describe('Test with mock', function () {
        describe('Test add', function () {
            it('Should add inbox message which fail as not able to find user', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } },
                                    Inbox: { create: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.generateContent = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Inbox = proxyquire('../../server/objects/inbox',
                    {'../models': stubModel, './mail': stubMail});
                var inbox = new Inbox();
                inbox.add('template', {}, 1)
                    .then(function (msg) {
                        return done('Should add message');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Unable to find user : Mock to fail');
                        return done();
                    });
            });
            it('Should add inbox message which fail as not able to create inbox', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, email: 'jbillay@gmail.com'}); return deferred.promise; } },
                                    Inbox: { create: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.generateContent = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Inbox = proxyquire('../../server/objects/inbox',
                    {'../models': stubModel, './mail': stubMail});
                var inbox = new Inbox();
                inbox.add('template', {}, 1)
                    .then(function (msg) {
                        return done('Should add message');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Inbox : not able to create inbox : Mock to fail');
                        return done();
                    });
            });
            it('Should add inbox message which fail as not able set user', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, email: 'jbillay@gmail.com'}); return deferred.promise; } },
                                    Inbox: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                                        setUser: function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                                    }); return deferred.promise; } } };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.generateContent = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Inbox = proxyquire('../../server/objects/inbox',
                    {'../models': stubModel, './mail': stubMail});
                var inbox = new Inbox();
                inbox.add('template', {}, 1)
                    .then(function (msg) {
                        return done('Should add message');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Inbox : not able to set User : Mock to fail');
                        return done();
                    });
            });
            it('Should add inbox message which fail to send mail', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, email: 'jbillay@gmail.com'}); return deferred.promise; } },
                                    Inbox: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                                        setUser: function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; }
                                    }); return deferred.promise; } } };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                stubMail.prototype.generateContent = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Inbox = proxyquire('../../server/objects/inbox',
                    {'../models': stubModel, './mail': stubMail});
                var inbox = new Inbox();
                inbox.add('template', {}, 1)
                    .then(function (msg) {
                        return done('Should add message');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Email has not been sent to user : Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test setIsRead', function () {
            it('Should set message as read which fail as not able to find message', function (done) {
                var stubModel = { Inbox: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Inbox = proxyquire('../../server/objects/inbox', {'../models': stubModel});
                var inbox = new Inbox();
                inbox.setIsRead(1, true, function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
        });
        describe('Test delete', function () {
            it('Should delete message which fail as not able to find message', function (done) {
                var stubModel = { Inbox: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Inbox = proxyquire('../../server/objects/inbox', {'../models': stubModel});
                var inbox = new Inbox();
                inbox.delete(1, function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
            it('Should delete message which fail to destroy message', function (done) {
                var stubModel = { Inbox: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    destroy: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var Inbox = proxyquire('../../server/objects/inbox', {'../models': stubModel});
                var inbox = new Inbox();
                inbox.delete(1, function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
        });
    });
});