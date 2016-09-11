/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Discussion = require('../../server/objects/discussion');
var Inbox = require('../../server/objects/inbox');
var Mail = require('../../server/objects/mail');
var settings = require('../../conf/config');
var sinon = require('sinon');
var q = require('q');
var proxyquire = require('proxyquire');

describe('Test of discussion object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of discussion over !');
    });

    describe('Test with local database', function () {
        it('Get messages private for a journey', function (done) {
            var discussion = new Discussion();
            discussion.getMessages(1, false, function (err, messageList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(messageList.length, 1);
                assert.equal(messageList[0].id, 3);
                assert.equal(messageList[0].message, 'Tres bonne nouvelle');
                assert.equal(messageList[0].is_public, false);
                discussion.getMessages(-1, false, function (err, messageList) {
                    assert.isNotNull(err);
                    assert.isNull(messageList);
                    return done();
                });
            });
        });

        it('Get messages public for a journey', function (done) {
            var discussion = new Discussion();
            discussion.getMessages(3, true, function (err, messageList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(messageList.length, 4);
                return done();
            });
        });

        it('Get users for a private discussion', function (done) {
            var discussion = new Discussion();
            discussion.getUsers(2)
                .then(function (users) {
                    assert.equal(users.length, 3);
                    discussion.getUsers(-1)
                        .then(function (users) {
                            assert.isNull(users);
                            return done();
                        })
                        .catch(function (err) {
                            return done(err);
                        });
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Get users for a public discussion', function (done) {
            var discussion = new Discussion();
            discussion.getPublicUsers(3)
                .then(function (list) {
                    assert.equal(list.users.length, 2);
                    assert.equal(list.emails.length, 1);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Add message private for a discussion', function (done) {
            var discussion = new Discussion(),
                message = {
                    id: 10,
                    message: 'J ajoute un nouveau message pour les tests',
                    email: null,
                    is_public: false,
                    createdAt: '2015-01-28 11:29:13',
                    updatedAt: '2015-01-28 11:29:13'
                },
                journeyId = 2,
                user = {
                    id: 1
                };
            discussion.set({});
            discussion.set(message);
            var tmp = discussion.get();
            assert.equal(tmp.id, 10);
            assert.equal(tmp.message, 'J ajoute un nouveau message pour les tests');
            assert.equal(tmp.is_public, false);
            discussion.addMessage(message.message, journeyId, false, user, null, function (err, newMessage) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(newMessage.id, 10);
                assert.equal(newMessage.message, 'J ajoute un nouveau message pour les tests');
                assert.equal(newMessage.is_public, false);
                assert.equal(newMessage.UserId, 1);
                assert.equal(newMessage.JourneyId, 2);
                return done();
            });
        });

        it('Add public message for a discussion from an unknown user', function (done) {
            var discussion = new Discussion(),
                message = {
                    id: 11,
                    message: 'Nouvelle question publique',
                    email: 'jbillay@gmail.com',
                    createdAt: '2015-01-28 11:29:13',
                    updatedAt: '2015-01-28 11:29:13'
                },
                journeyId = 2,
                user = null;
            discussion.set(message);
            var tmp = discussion.get();
            assert.equal(tmp.id, 11);
            assert.equal(tmp.message, 'Nouvelle question publique');
            assert.equal(tmp.is_public, true);
            discussion.addMessage(message.message, journeyId, true, user, null, function (err, newMessage) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(newMessage.id, 11);
                assert.equal(newMessage.message, 'Nouvelle question publique');
                assert.equal(newMessage.is_public, true);
                assert.equal(newMessage.JourneyId, 2);
                assert.isNull(newMessage.email);
                assert.isUndefined(newMessage.UserId);
                return done();
            });
        });

        it('Add public message for a discussion from an user with his email', function (done) {
            var discussion = new Discussion(),
                message = {
                    id: 11,
                    message: 'Nouvelle question publique',
                    is_public: true,
                    createdAt: '2015-01-28 11:29:13',
                    updatedAt: '2015-01-28 11:29:13'
                },
                journeyId = 2,
                user = null,
                email = 'ruestpierrestgermain@gmail.com';
            discussion.set(message);
            var tmp = discussion.get();
            assert.equal(tmp.id, 11);
            assert.equal(tmp.message, 'Nouvelle question publique');
            assert.equal(tmp.is_public, true);
            discussion.addMessage(message.message, journeyId, true, user, email, function (err, newMessage) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(newMessage.id, 11);
                assert.equal(newMessage.message, 'Nouvelle question publique');
                assert.equal(newMessage.is_public, true);
                assert.equal(newMessage.JourneyId, 2);
                assert.equal(newMessage.email, 'ruestpierrestgermain@gmail.com');
                return done();
            });
        });

        it('Add public message for a discussion from an internal user', function (done) {
            var discussion = new Discussion(),
                message = {
                    id: 11,
                    message: 'Nouvelle question publique',
                    is_public: true,
                    createdAt: '2015-01-28 11:29:13',
                    updatedAt: '2015-01-28 11:29:13'
                },
                journeyId = 2,
                user = { id: 1 },
                email = null;
            discussion.set(message);
            var tmp = discussion.get();
            assert.equal(tmp.id, 11);
            assert.equal(tmp.message, 'Nouvelle question publique');
            assert.equal(tmp.is_public, true);
            discussion.addMessage(message.message, journeyId, true, user, email, function (err, newMessage) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(newMessage.id, 11);
                assert.equal(newMessage.message, 'Nouvelle question publique');
                assert.equal(newMessage.is_public, true);
                assert.equal(newMessage.JourneyId, 2);
                assert.isNull(newMessage.email);
                assert.equal(newMessage.UserId, 1);
                return done();
            });
        });

        it('Notified users of a public discussion', function (done) {
            var discussion = new Discussion(),
                inbox = new Inbox(),
                mail = new Mail(),
                user = {
                    id: 3,
                    firstname: 'Emilie',
                    lastname: 'Francisco'
                },
                user_owner = { id: 2 };

            sinon.spy(mail, 'send');
            sinon.spy(mail, 'setTo');
            sinon.spy(mail, 'generateContent');
            sinon.spy(mail, 'sendEmail');
            discussion.setMail(mail);
            discussion.notificationMessage(3, 'test', true, user, function (err, msg) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal('Public msg notifications has been sent to users', msg);
                assert.isTrue(mail.sendEmail.calledOnce);
                assert.isTrue(mail.send.calledOnce);
                assert.isTrue(mail.generateContent.calledOnce);
                assert.isTrue(mail.setTo.calledOnce);
                assert.isTrue(mail.setTo.calledWith('ruestpierrestgermain@gmail.com'));
                inbox.getList(user, function (err, messages) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(messages.length, 0);
                    inbox.getList(user_owner, function (err, messages) {
                        if (err) return done(err);
                        assert.isNull(err);
                        assert.equal(messages.length, 3);
                        discussion.notificationMessage(3, 'test2', true, user, function (err, msg) {
                            if (err) return done(err);
                            assert.isNull(err);
                            assert.equal('Public msg notifications has been sent to users', msg);
                            assert.isTrue(mail.sendEmail.calledTwice);
                            assert.isTrue(mail.send.calledTwice);
                            assert.isTrue(mail.generateContent.calledTwice);
                            assert.isTrue(mail.setTo.calledTwice);
                            assert.isTrue(mail.setTo.calledWith('ruestpierrestgermain@gmail.com'));
                            mail.sendEmail.restore();
                            mail.send.restore();
                            mail.generateContent.restore();
                            mail.setTo.restore();
                            inbox.getList(user, function (err, messages) {
                                if (err) return done(err);
                                assert.isNull(err);
                                assert.equal(messages.length, 0);
                                inbox.getList(user_owner, function (err, messages) {
                                    if (err) return done(err);
                                    assert.isNull(err);
                                    assert.equal(messages.length, 4);
                                    return done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('Notified users of a private discussion', function (done) {
            var discussion = new Discussion(),
                inbox = new Inbox(),
                user = { id: 3 },
                user_owner = { id: 1 };
            discussion.notificationMessage(2, 'test', false, user, function (err, msg) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal('Private msg notifications has been sent to users', msg);
                inbox.getList(user_owner, function (err, messages) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(messages.length, 3);
                    inbox.getList(user, function (err, messages) {
                        if (err) return done(err);
                        assert.isNull(err);
                        assert.equal(messages.length, 0);
                        return done();
                    });
                });
            });
        });
    });
    describe('Test with mocks', function () {
        describe('Test getUsers', function () {
            it('Should get users of a discussion which fail due to journey issue', function (done) {
                var stub = { Journey: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stub});
                var discussion = new Discussion();
                discussion.getUsers(2)
                    .catch(function (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should get users of a discussion which fail due to user issue', function (done) {
                var stub = { User: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stub});
                var discussion = new Discussion();
                discussion.getUsers(2)
                    .catch(function (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test getPublicUsers', function () {
            it('Should get public users of a discussion which fail due to discussion empty', function (done) {
                var stub = { Discussion: { findAll: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; } } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stub});
                var discussion = new Discussion();
                discussion.getPublicUsers(2)
                    .then(function (users) {
                        assert.isNull(users);
                        return done();
                    });
            });
            it('Should get public users of a discussion which fail due to discussion issue', function (done) {
                var stub = { Discussion: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stub});
                var discussion = new Discussion();
                discussion.getPublicUsers(2)
                    .catch(function (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should get users of a discussion which fail due to user issue', function (done) {
                var stub = {
                    Discussion: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([
                        {id: 1, UserId: 1, Journey: { UserId: 2} },
                        {id: 2, UserId: 3, Journey: { UserId: 5} }
                    ]); return deferred.promise; } },
                    User: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stub});
                var discussion = new Discussion();
                discussion.getPublicUsers(2)
                    .catch(function (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test addMessage', function () {
            it('Should add message to a discussion which fail due to journey not defined', function (done) {
                var stub = { Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; } } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stub});
                var discussion = new Discussion();
                discussion.addMessage('toto', 2, true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, 'jbillay@gmail.com', function (err, msg) {
                    assert.equal(err, 'Error: No Journey found');
                    assert.isNull(msg);
                    return done();
                });
            });
            it('Should add message to a discussion which fail due to journey issue', function (done) {
                var stub = { Journey: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stub});
                var discussion = new Discussion();
                discussion.addMessage('toto', 2, true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, 'jbillay@gmail.com', function (err, msg) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(msg);
                    return done();
                });
            });
            it('Should add message to a discussion which fail inbox integration', function (done) {
                var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: {UserId: 1, name: 'toto'}}); return deferred.promise; } },
                                    Discussion: { create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                        { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve(
                                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                        ); return deferred.promise; } },
                                        { setUser: function (obj) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                                    ); return deferred.promise; } },
                                    User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, firstname: 'test', lastname: 'firstname'}); return deferred.promise; } }
                            };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stubModel, './inbox': stubInbox, './mail': stubMail});
                var discussion = new Discussion();
                discussion.addMessage('toto', 2, true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, 'jbillay@gmail.com', function (err, msg) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(msg);
                    return done();
                });
            });
            it('Should add message to a discussion which fail to set user', function (done) {
                var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: {UserId: 1, name: 'toto'}}); return deferred.promise; } },
                                    Discussion: { create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                        { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve(
                                            { setUser: function (obj) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                                        ); return deferred.promise; } },
                                        { setUser: function (obj) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                                    ); return deferred.promise; } },
                                    User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, firstname: 'test', lastname: 'firstname'}); return deferred.promise; } }
                            };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stubModel, './inbox': stubInbox, './mail': stubMail});
                var discussion = new Discussion();
                discussion.addMessage('toto', 2, true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, 'jbillay@gmail.com', function (err, msg) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(msg);
                    return done();
                });
            });
            it('Should add message to a discussion which fail as no user defined and Inbox fail', function (done) {
                var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: {UserId: 1, name: 'toto'}}); return deferred.promise; } },
                                    Discussion: { create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                        { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                        { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                    ); return deferred.promise; } },
                                    User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, firstname: 'test', lastname: 'firstname'}); return deferred.promise; } }
                            };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stubModel, './inbox': stubInbox, './mail': stubMail});
                var discussion = new Discussion();
                discussion.addMessage('toto', 2, true, null, 'jbillay@gmail.com', function (err, msg) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(msg);
                    return done();
                });
            });
            it('Should add message to a discussion which fail to add in Inbox for undefined user', function (done) {
                var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: {UserId: 1, name: 'toto'}}); return deferred.promise; } },
                                    Discussion: { create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                        { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                        { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                    ); return deferred.promise; } },
                                    User: { find: function (params) { var deferred = q.defer(); deferred.reject({id: 1}); return deferred.promise; } }
                            };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stubModel, './inbox': stubInbox});
                var discussion = new Discussion();
                discussion.addMessage('toto', 2, true, null, 'jbillay@gmail.com', function (err, msg) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(msg);
                    return done();
                });
            });
        });
        describe('Test notificationMessage', function () {
            it('Should notify message of a discussion which fail to get journey', function (done) {
                var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } },
                                    Discussion: { create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                        { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                        { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                    ); return deferred.promise; } },
                                    User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                var stubMail = function mail() {};
                stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                stubMail.prototype.setTo = function(mail) { return mail; };
                stubMail.prototype.setSubject = function(subject) { return subject; };
                stubMail.prototype.setContentHtml = function(content) { return content; };
                stubMail.prototype.setText = function(text) { return text; };
                stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var stubAsync = { queue: function () { return {
                    push: function (option, callback) { return callback('Mock to fail', null); } }; } };
                var Discussion = proxyquire('../../server/objects/discussion',
                    {'../models': stubModel, './inbox': stubInbox, './mail': stubMail, 'async': stubAsync});
                var discussion = new Discussion();
                discussion.notificationMessage(2, 'message', false, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(msg);
                    return done();
                });
            });
            describe('Notification of public message', function () {
                it('Should notify public message of a discussion which fail to add into user Inbox', function (done) {
                    var spyConsole = sinon.spy(console, 'log');
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: { name: 'toto' } }); return deferred.promise; } },
                                        Discussion: {   create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                        ); return deferred.promise; },
                                                        findAll: function (obj) { var deferred = q.defer(); deferred.resolve([
                                                            {id: 1, UserId: 1, email: 'jbillay@gmail.com', Journey: { UserId: 2} },
                                                            {id: 2, UserId: 3, email: 'jbillay@gmail.com', Journey: { UserId: 5} },
                                                            {id: 2, UserId: null, email: 'jbillay@gmail.com', Journey: { UserId: 5} }
                                                        ]); return deferred.promise; } },
                                        User: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 6}, {id: 3}]); return deferred.promise; } }
                                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                    stubMail.prototype.setTo = function(mail) { return mail; };
                    stubMail.prototype.setSubject = function(subject) { return subject; };
                    stubMail.prototype.setContentHtml = function(content) { return content; };
                    stubMail.prototype.setText = function(text) { return text; };
                    stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail});
                    var discussion = new Discussion();
                    discussion.notificationMessage(2, 'message', true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) {
                        assert.isNull(err);
                        assert.equal(msg, 'Public msg notifications has been sent to users');
                        console.log.restore();
                        return done();
                    });
                });
                it('Should notify public message of a discussion which fail to send mail', function (done) {
                    var spyConsole = sinon.spy(console, 'log');
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: { name: 'toto' } }); return deferred.promise; } },
                                        Discussion: {   create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                        ); return deferred.promise; },
                                                        findAll: function (obj) { var deferred = q.defer(); deferred.resolve([
                                                            {id: 1, UserId: 1, email: 'jbillay@gmail.com', Journey: { UserId: 2} },
                                                            {id: 2, UserId: 3, email: 'jbillay@gmail.com', Journey: { UserId: 5} },
                                                            {id: 2, UserId: null, email: 'jbillay@gmail.com', Journey: { UserId: 5} }
                                                        ]); return deferred.promise; } },
                                        User: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 6}, {id: 3}]); return deferred.promise; } }
                                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.sendEmail = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail});
                    var discussion = new Discussion();
                    discussion.notificationMessage(2, 'message', true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) {
                        console.log.restore();
                        assert.isNull(err);
                        assert.equal(msg, 'Public msg notifications has been sent to users');
                        assert.equal(spyConsole.callCount, 4);
                        assert.equal(spyConsole.lastCall.args[0].toString(), 'Error: Message not sent : Mock to fail');
                        return done();
                    });
                });
                it('Should notify public message of a discussion which fail to push unknown msg in the queue', function (done) {
                    var spyConsole = sinon.spy(console, 'log');
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: { name: 'toto' } }); return deferred.promise; } },
                                        Discussion: {   create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                        ); return deferred.promise; },
                                                        findAll: function (obj) { var deferred = q.defer(); deferred.resolve([
                                                            {id: 1, UserId: null, email: 'jbillay@gmail.com', Journey: { UserId: 2} },
                                                            {id: 2, UserId: null, email: 'richard.couret@free.fr', Journey: { UserId: 5} }
                                                        ]); return deferred.promise; } },
                                        User: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([]); return deferred.promise; } }
                                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.sendEmail= function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubAsync = { queue: function () { var drain = function () {
                            assert.isTrue(spyConsole.calledThrice); assert.equal(spyConsole.secondCall.args[0].toString(), 'Error: Message not sent : Mock to fail');
                            console.log.restore(); return done(); };
                            setTimeout(function () { drain(); }, 200);
                            return {
                        push: function (option, callback) { return callback('Mock to fail', null); },
                        drain: drain }; } };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail, 'async': stubAsync});
                    var discussion = new Discussion();
                    // test done inside mock drain function has drain could not been call has we mock queue
                    discussion.notificationMessage(2, 'message', true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) { });
                });
                it('Should notify public message of a discussion which fail to get public users', function (done) {
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: { name: 'toto' } }); return deferred.promise; } },
                        Discussion: { create: function (obj) { var deferred = q.defer(); deferred.resolve(
                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                        ); return deferred.promise; },
                            findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 1, UserId: 1, Journey: { UserId: 2 } }, {id: 2, UserId: 2, Journey: { UserId: 5 } }]); return deferred.promise; } },
                        User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                            findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.sendEmail= function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubAsync = { queue: function () { return {
                        push: function (option, callback) { return callback(null, 'ok'); }  }; } };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail, 'async': stubAsync});
                    var discussion = new Discussion();
                    discussion.notificationMessage(2, 'message', true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) {
                        assert.equal(err, 'Error: Error: Mock to fail');
                        assert.isNull(msg);
                        return done();
                    });
                });
                it('Should notify public message of a discussion which fail to push user msg in the queue', function (done) {
                    var spyConsole = sinon.spy(console, 'log');
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: { name: 'toto' } }); return deferred.promise; } },
                        Discussion: {   create: function (obj) { var deferred = q.defer(); deferred.resolve(
                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                        ); return deferred.promise; },
                            findAll: function (obj) { var deferred = q.defer(); deferred.resolve([
                                {id: 1, UserId: 1, Journey: { UserId: 2} },
                                {id: 2, UserId: 3, Journey: { UserId: 5} }
                            ]); return deferred.promise; } },
                        User: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 6}, {id: 3}]); return deferred.promise; } }
                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.sendEmail= function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubAsync = { queue: function () { var drain = function () {
                        assert.isTrue(spyConsole.calledThrice); assert.equal(spyConsole.secondCall.args[0].toString(), 'Error: Message not sent : Mock to fail');
                        console.log.restore(); return done(); };
                        setTimeout(function () { drain(); }, 200);
                        return {
                            push: function (option, callback) { return callback('Mock to fail', null); },
                            drain: drain }; } };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail, 'async': stubAsync});
                    var discussion = new Discussion();
                    // test done inside mock drain function has drain could not been call has we mock queue
                    discussion.notificationMessage(2, 'message', true, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) { });
                });
            });
            describe('Notification of private message', function () {
                it('Should notify private message of a discussion which fail to add into user Inbox', function (done) {
                    var spyConsole = sinon.spy(console, 'log');
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                                            {id: 1, UserId: 2, Run: { name: 'toto' }, getJoins: function () { var deferred = q.defer(); deferred.resolve([{UserId: 1}, {UserId: 2}]); return deferred.promise; } }
                                            ); return deferred.promise; } },
                                        Discussion: {   create: function (obj) { var deferred = q.defer(); deferred.resolve(
                                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                                        ); return deferred.promise; },
                                                        findAll: function (obj) { var deferred = q.defer(); deferred.resolve([
                                                            {id: 1, UserId: 1, email: 'jbillay@gmail.com', Journey: { UserId: 2} },
                                                            {id: 2, UserId: 3, email: 'jbillay@gmail.com', Journey: { UserId: 5} }
                                                        ]); return deferred.promise; } },
                                        User: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 6}, {id: 3}]); return deferred.promise; } }
                                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.init = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                    stubMail.prototype.setTo = function(mail) { return mail; };
                    stubMail.prototype.setSubject = function(subject) { return subject; };
                    stubMail.prototype.setContentHtml = function(content) { return content; };
                    stubMail.prototype.setText = function(text) { return text; };
                    stubMail.prototype.send = function () { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail});
                    var discussion = new Discussion();
                    discussion.notificationMessage(2, 'message', false, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) {
                        console.log.restore();
                        assert.equal(spyConsole.callCount, 3);
                        assert.equal(spyConsole.lastCall.args[0].toString(), 'Error: Message not sent : Mock to fail');
                        assert.isNull(err);
                        assert.equal(msg, 'Private msg notifications has been sent to users');
                        return done();
                    });
                });
                it('Should notify private message of a discussion which fail to get users', function (done) {
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                            {id: 1, UserId: 2, Run: { name: 'toto' }, getJoins: function () { var deferred = q.defer(); deferred.resolve([{UserId: 1}, {UserId: 2}]); return deferred.promise; } }
                        ); return deferred.promise; } },
                        Discussion: { create: function (obj) { var deferred = q.defer(); deferred.resolve(
                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                        ); return deferred.promise; },
                            findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 1, UserId: 1, Journey: { UserId: 2 } }, {id: 2, UserId: 2, Journey: { UserId: 5 } }]); return deferred.promise; } },
                        User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                            findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.sendEmail= function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubAsync = { queue: function () { return {
                        push: function (option, callback) { return callback(null, 'ok'); }  }; } };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail, 'async': stubAsync});
                    var discussion = new Discussion();
                    discussion.notificationMessage(2, 'message', false, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) {
                        assert.equal(err, 'Error: Error: Mock to fail');
                        assert.isNull(msg);
                        return done();
                    });
                });
                it('Should notify private message of a discussion which fail to push user msg in the queue', function (done) {
                    var spyConsole = sinon.spy(console, 'log');
                    var stubModel = {   Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                            {id: 1, UserId: 2, Run: { name: 'toto' }, getJoins: function () { var deferred = q.defer(); deferred.resolve([{UserId: 1}, {UserId: 2}]); return deferred.promise; } }
                        ); return deferred.promise; } },
                        Discussion: {   create: function (obj) { var deferred = q.defer(); deferred.resolve(
                            { setJourney: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                            { setUser: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                        ); return deferred.promise; },
                            findAll: function (obj) { var deferred = q.defer(); deferred.resolve([
                                {id: 1, UserId: 1, Journey: { UserId: 2} },
                                {id: 2, UserId: 3, Journey: { UserId: 5} }
                            ]); return deferred.promise; } },
                        User: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 6}, {id: 3}]); return deferred.promise; } }
                    };
                    var stubInbox = function inbox() {};
                    stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                    var stubMail = function mail() {};
                    stubMail.prototype.sendEmail= function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                    var stubAsync = { queue: function () { var drain = function () {
                        assert.isTrue(spyConsole.calledThrice); assert.equal(spyConsole.secondCall.args[0].toString(), 'Error: Message not sent : Mock to fail');
                        console.log.restore(); return done(); };
                        setTimeout(function () { drain(); }, 200);
                        return {
                            push: function (option, callback) { return callback('Mock to fail', null); },
                            drain: drain }; } };
                    var Discussion = proxyquire('../../server/objects/discussion',
                        {'../models': stubModel, './inbox': stubInbox, './mail': stubMail, 'async': stubAsync});
                    var discussion = new Discussion();
                    // test done inside mock drain function has drain could not been call has we mock queue
                    discussion.notificationMessage(2, 'message', false, {id: 1, firstname: 'jeremy', lastname: 'billay'}, function (err, msg) { });
                });
            });
        });
    });
});