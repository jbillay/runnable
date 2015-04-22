/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../models');
var Inbox = require('../objects/inbox');
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

describe('Test of inbox object', function () {
    beforeEach(function (done) {
        this.timeout(6000);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
                    function(callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/options.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/validationJourneys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/inboxes.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
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
        console.log('Test of inbox over !');
    });

    it('Get nb unread message for a user', function (done) {
        var inbox = new Inbox();
        inbox.countUnread(2, function (err, nb) {
            if (err) console.log(err);
            assert.isNull(err);
            assert.equal(nb, 1);
            inbox.countUnread(-1, function (err, nb) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Set a message as read', function (done) {
        var inbox = new Inbox();
        inbox.setIsRead(4, true, function (err, message) {
            if (err) console.log(err);
            assert.isNull(err);
            assert.equal(message.is_read, 1);
            inbox.countUnread(2, function (err, nb) {
                assert.equal(nb, 0);
                inbox.setIsRead(4, true, function (err, message) {
                    assert.isNotNull(err);
                    done();
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
            if (err) console.log(err);
            assert.isNull(err);
            assert.equal(messages.length, 2);
            inbox.getList(user2, function (err, messages) {
                assert.isNotNull(err);
                assert.isNull(messages);
                done();
            });
        });
    });

    it('Create a new Inbox message', function (done) {
        var inbox = new Inbox(),
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
        inbox.set(message);
        var tmp = inbox.get();
        assert.equal(tmp.title, 'Test unitaire');
        assert.equal(tmp.message, 'Test unitaire pour la création d un message');
        assert.equal(tmp.userId, 1);
        assert.equal(tmp.is_read, false);
        inbox.add(template, values, userId, function (err, newMessage) {
            if (err) console.log('Error :' + err);
            assert.isNull(err);
            assert.equal(newMessage.id, 5);
            assert.equal(newMessage.title, 'Email pour 3');
            assert.equal(newMessage.message, 'TEST message Inbox');
            assert.equal(newMessage.is_read, false);
            assert.equal(newMessage.UserId, userId);
            done();
        });
    });
});