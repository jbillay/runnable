/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../models');
var Discussion = require('../objects/discussion');
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

    it('Get messages for a journey', function (done) {
        var discussion = new Discussion();
        discussion.getMessages(1, function (err, messageList) {
            if (err) console.log(err);
            assert.isNull(err);
            assert.equal(messageList.length, 2);
            discussion.getMessages(-1, function (err, messageList) {
                assert.isNotNull(err);
                assert.isNull(messageList);
                done();
            });
        });
    });

    it('Get users for a discussion', function (done) {
        var discussion = new Discussion();
        discussion.getUsers(2, function (err, users) {
            if (err) console.log(err);
            assert.isNull(err);
            assert.equal(users.length, 2);
            discussion.getUsers(-1, function (err, users) {
                assert.isNotNull(err);
                assert.isNull(users);
                done();
            });
        });
    });

    it('Add message for a discussion', function (done) {
        var discussion = new Discussion(),
            message = {
                id: 5,
                message: 'J ajoute un nouveau message pour les tests',
                createdAt: '2015-01-28 11:29:13',
                updatedAt: '2015-01-28 11:29:13'
            },
            journeyId = 2,
            user = {
                id: 1
            };
        discussion.set(message);
        var tmp = discussion.get();
        assert.equal(tmp.id, 5);
        assert.equal(tmp.message, 'J ajoute un nouveau message pour les tests');
        discussion.addMessage(message.message, journeyId, user, function (err, newMessage) {
            if (err) console.log(err);
            assert.isNull(err);
            assert.equal(newMessage.id, 5);
            assert.equal(newMessage.message, 'J ajoute un nouveau message pour les tests');
            assert.equal(newMessage.UserId, 1);
            assert.equal(newMessage.JourneyId, 2);
            done();
        });
    });
});