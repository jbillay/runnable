/**
 * Created by jeremy on 06/02/15.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Participate = require('../../server/objects/participate');
var settings = require('../../conf/config');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of participate object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of participate over !');
    });

    describe('Test with local database', function () {
        it('Get list user participate a run', function (done) {
            var participate = new Participate();
            participate.userRunList(5, function (err, users) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(users.length, 2);
                participate.userRunList(-1, function (err, users) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });

        it('Get list of participate a user', function (done) {
            var participate = new Participate();
            participate.userList(1, function (err, runs) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(runs.length, 4);
                participate.userList(-1, function (err, runs) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });

        it('Add participate to a user', function (done) {
            var participate = new Participate(),
                runId = 4,
                user = {
                    id: 2
                },
                participe = {
                    userId: 2,
                    runId : 4,
                    createdAt: '2015-01-26 10:43:40',
                    updatedAt: '2015-01-26 10:43:40'
                };
            participate.set({});
            participate.set(participe);
            var tmp = participate.get();
            assert.equal(tmp.userId, 2);
            assert.equal(tmp.runId, 4);
            participate.add(runId, user, function (err, participate) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(participate.id, 6);
                assert.equal(participate.UserId, 2);
                assert.equal(participate.RunId, 4);
                return done();
            });
        });

        it('Get list of participate for a user', function (done) {
            var participate = new Participate(),
                run = {
                    id: 5,
                    name: 'Test'
                },
                journey = {
                    journeyId: 3,
                    journeyStart: 'Luzarches',
                    PartnerId: 1
                };
            participate.notify(run, journey, function (err, notif) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(notif.length, 2);
                assert.equal(notif[0].User.firstname, 'Jeremy');
                assert.equal(notif[0].User.lastname, 'Billay');
                assert.equal(notif[0].User.email, 'jbillay@gmail.com');
                return done();
            });
        });
    });
    describe('Test with mock', function () {
        describe('Test add', function () {
            it('Should add participate which fail to find run', function (done) {
                var stub = { Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Participate = proxyquire('../../server/objects/participate', {'../models': stub});
                var participate = new Participate();
                participate.add(1, {id: 2}, function (err, participate) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not participate !');
                    }
                });
            });
            it('Should add participate which fail to find user', function (done) {
                var stub = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                User: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Participate = proxyquire('../../server/objects/participate', {'../models': stub});
                var participate = new Participate();
                participate.add(1, {id: 2}, function (err, participate) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not participate !');
                    }
                });
            });
        });
        describe('Test notify', function () {
            it('Should notify participate which fail to find run', function (done) {
                var stub = { Run: { findOne: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Participate = proxyquire('../../server/objects/participate', {'../models': stub});
                var participate = new Participate();
                participate.notify({id: 1}, {id: 2}, function (err, participate) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not participate !');
                    }
                });
            });
            it('Should notify participate which fail to find user', function (done) {
                var stub = { Run: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                            Participate: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Participate = proxyquire('../../server/objects/participate', {'../models': stub});
                var participate = new Participate();
                participate.notify({id: 1}, {id: 2}, function (err, participate) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not participate !');
                    }
                });
            });
        });
    });
});