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
            assert.equal(messageList.length, 2);
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
                id: 7,
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
        discussion.set(message);
        var tmp = discussion.get();
        assert.equal(tmp.id, 7);
        assert.equal(tmp.message, 'J ajoute un nouveau message pour les tests');
        assert.equal(tmp.is_public, false);
        discussion.addMessage(message.message, journeyId, false, user, null, function (err, newMessage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(newMessage.id, 7);
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
                id: 8,
                message: 'Nouvelle question publique',
                is_public: true,
                createdAt: '2015-01-28 11:29:13',
                updatedAt: '2015-01-28 11:29:13'
            },
            journeyId = 2,
            user = null;
        discussion.set(message);
        var tmp = discussion.get();
        assert.equal(tmp.id, 8);
        assert.equal(tmp.message, 'Nouvelle question publique');
        assert.equal(tmp.is_public, true);
        discussion.addMessage(message.message, journeyId, true, user, null, function (err, newMessage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(newMessage.id, 8);
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
                id: 8,
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
        assert.equal(tmp.id, 8);
        assert.equal(tmp.message, 'Nouvelle question publique');
        assert.equal(tmp.is_public, true);
        discussion.addMessage(message.message, journeyId, true, user, email, function (err, newMessage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(newMessage.id, 8);
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
                id: 8,
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
        assert.equal(tmp.id, 8);
        assert.equal(tmp.message, 'Nouvelle question publique');
        assert.equal(tmp.is_public, true);
        discussion.addMessage(message.message, journeyId, true, user, email, function (err, newMessage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(newMessage.id, 8);
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
            assert.equal('Notifications sent to users', msg);
            assert.isTrue(mail.sendEmail.calledOnce);
            assert.isTrue(mail.send.calledOnce);
            assert.isTrue(mail.generateContent.calledOnce);
            assert.isTrue(mail.setTo.calledOnce);
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
                    assert.equal(messages.length, 3);
                    return done();
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
            assert.equal('Notifications sent to users', msg);
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