/**
 * Created by jeremy on 31/01/15.
 */

"use strict";

var assert = require("chai").assert;
var models = require('../models');
var User = require('../objects/user');
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

describe('Test of user object', function () {
    "use strict";
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
                    }
                ], function (err, result) {
                    done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log("Test of user over !");
    });

    it('Get feedback on driver', function (done) {
        var user = new User();
        user.getPublicDriverInfo(2, function (err, feedback) {
            if (err) return done(err);
            assert.equal(feedback.length, 1);
            assert.equal(feedback[0].rate_driver, 3);
            assert.equal(feedback[0].rate_service, 5);
            assert.equal(feedback[0].UserId, 1);
            user.getPublicDriverInfo(-10, function (err, user) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Get user public info', function (done) {
        var user = new User();
        user.getPublicInfo(1, function (err, userInfo) {
            if (err) return done(err);
            assert.equal(userInfo.firstname, "Jeremy");
            assert.equal(userInfo.lastname, "Billay");
            assert.equal(userInfo.address, "Saint Germain en laye");
            assert.equal(userInfo.email, "jbillay@gmail.com");
            assert.equal(userInfo.isActive, 1);
            assert.equal(userInfo.role, "admin");
            user.getPublicInfo(-10, function (err, user) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Toggle active flag for a user', function (done) {
        var user = new User();
        user.toggleActive(1, function (err, userChanged) {
            if (err) return done(err);
            assert.equal(userChanged.firstname, "Jeremy");
            assert.equal(userChanged.lastname, "Billay");
            assert.equal(userChanged.address, "Saint Germain en laye");
            assert.equal(userChanged.email, "jbillay@gmail.com");
            assert.equal(userChanged.isActive, 0);
            assert.equal(userChanged.role, "admin");
            user.toggleActive(1, function (err, userChanged) {
                assert.equal(userChanged.isActive, 1);
                user.toggleActive(-1, function (err, userChanged) {
                    assert.isNotNull(err);
                    done();
                });
            });
        });
    });

    it('Update password for a user', function (done) {
        var user = new User();
        user.updatePassword('jbillay@gmail.com', 'test', function (err, userChanged) {
            if (err) return done(err);
            assert.equal(userChanged.firstname, "Jeremy");
            assert.equal(userChanged.lastname, "Billay");
            assert.equal(userChanged.address, "Saint Germain en laye");
            assert.equal(userChanged.email, "jbillay@gmail.com");
            assert.equal(userChanged.role, "admin");
            assert.notEqual(userChanged.hashedPassword, "30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==");
            assert.notEqual(userChanged.salt, "T75xyNJfL19hzc778A08HQ==");
            user.updatePassword(4, 'test', function (err, userChanged) {
                assert.isNotNull(err);
                user.updatePassword('jbillay@gmail.com', null, function (err, userChanged) {
                    assert.isNotNull(err);
                    done();
                });
            });
        });
    });

    it('Get user list', function (done) {
        var user = new User();
        user.getList(function (err, userList) {
            if (err) return done(err);
            assert.equal(userList.length, 2);
            done();
        });
    });

    it('Get user by email', function (done) {
        var user = new User();
        user.getByEmail('jbillay@gmail.com', function (err, userDetail) {
            if (err) return done(err);
            assert.equal(userDetail.firstname, "Jeremy");
            assert.equal(userDetail.lastname, "Billay");
            assert.equal(userDetail.address, "Saint Germain en laye");
            assert.equal(userDetail.email, "jbillay@gmail.com");
            assert.equal(userDetail.role, "admin");
            assert.equal(userDetail.isActive, 1);
            user.getByEmail(-1, function (err, userDetail) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Get user by id', function (done) {
        var user = new User();
        user.getById(2, function (err, userDetail) {
            if (err) return done(err);
            assert.equal(userDetail.firstname, "Richard");
            assert.equal(userDetail.lastname, "Couret");
            assert.equal(userDetail.address, "Bouffemont");
            assert.equal(userDetail.email, "richard.couret@free.fr");
            assert.equal(userDetail.role, "editor");
            assert.equal(userDetail.isActive, 0);
            user.getById('TOTO', function (err, userDetail) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('Create new user', function (done) {
        var user = new User(),
            newUser = {
                "firstname": "Emilie",
                "lastname": "Francisco",
                "address": "Saint Germain en laye",
                "email": "emiliefrancisco@hotmail.fr",
                "isActive": 1
            },
            newUser2 = {
                "firstname": "Test",
                "lastname": "Test",
                "address": "Test"
            };
        user.set(newUser);
        var tmp = user.get();
        assert.equal(tmp.firstname, "Emilie");
        assert.equal(tmp.lastname, "Francisco");
        assert.equal(tmp.address, "Saint Germain en laye");
        assert.equal(tmp.email, "emiliefrancisco@hotmail.fr");
        assert.equal(tmp.role, "user");
        assert.equal(tmp.isActive, 1);
        user.save(function (err, newUser) {
            if (err) return done(err);
            assert.equal(newUser.firstname, "Emilie");
            assert.equal(newUser.lastname, "Francisco");
            assert.equal(newUser.address, "Saint Germain en laye");
            assert.equal(newUser.email, "emiliefrancisco@hotmail.fr");
            assert.equal(newUser.role, "user");
            assert.equal(newUser.isActive, 1);
            user.set(newUser2);
            user.save(function (err, newUser) {
                assert.isNotNull(err);
                done();
            });
        });
    });

    it('First activation of a user', function (done) {
        var user = new User(),
            newUser = {
                "id": 3,
                "firstname": "Emilie",
                "lastname": "Francisco",
                "address": "Saint Germain en laye",
                "password": "emilie",
                "email": "emiliefrancisco@hotmail.fr",
                "isActive": 0,
                "role": "user",
                "createdAt": "2015-02-04 18:55:39",
                "updatedAt": "2015-02-04 18:55:39"
            };
        user.set(newUser);
        user.save(function (err, createdUser) {
            if (err) return done(err);
            var hash = new Date(createdUser.createdAt).getTime().toString();
            user.activate(createdUser.id, hash, function (err, newUser) {
                if (err) {
                    console.log('Error: ' + err);
                }
                assert.equal(newUser.firstname, "Emilie");
                assert.equal(newUser.lastname, "Francisco");
                assert.equal(newUser.address, "Saint Germain en laye");
                assert.equal(newUser.email, "emiliefrancisco@hotmail.fr");
                assert.equal(newUser.role, "user");
                assert.equal(newUser.isActive, 1);
                user.activate(1, '', function (err, newUser) {
                    assert.isNotNull(err);
                    user.activate(-1, '', function (err, newUser) {
                        assert.isNotNull(err);
                        done();
                    });
                });
            });
        });
    });
});