/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Discussion = require('../../server/objects/discussion');
var async = require('async');
var q = require('q');

var loadData = function (fix) {
    var deferred = q.defer();
    models[fix.model].create(fix.data)
        .complete(function (err, result) {
            if (err) {
                console.log(err);
            }
            deferred.resolve(result);
        });
    return deferred.promise;
};

describe('Test of discussion object', function () {
    beforeEach(function (done) {
        this.timeout(6000);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
                    function (callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/discussions.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    }
                ], function (err, result) {
                    done();
                });
            });
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

    it('Get users for a discussion', function (done) {
        var discussion = new Discussion();
        discussion.getUsers(2, function (err, users) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(users.length, 2);
            discussion.getUsers(-1, function (err, users) {
                assert.isNotNull(err);
                assert.isNull(users);
                return done();
            });
        });
    });

    it('Add message private for a discussion', function (done) {
        var discussion = new Discussion(),
            message = {
                id: 7,
                message: 'J ajoute un nouveau message pour les tests',
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
        discussion.addMessage(message.message, journeyId, false, user, function (err, newMessage) {
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

    it('Add message public for a discussion', function (done) {
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
        discussion.addMessage(message.message, journeyId, true, user, function (err, newMessage) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(newMessage.id, 8);
            assert.equal(newMessage.message, 'Nouvelle question publique');
            assert.equal(newMessage.is_public, true);
            assert.equal(newMessage.JourneyId, 2);
            return done();
        });
    });
});