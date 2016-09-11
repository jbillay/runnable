/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Join = require('../../server/objects/join');
var Invoice = require('../../server/objects/invoice');
var Inbox = require('../../server/objects/inbox');
var settings = require('../../conf/config');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of join object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of join over !');
    });

    describe('Test with local database', function () {
        it('Get join list', function (done) {
            var join = new Join();
            join.getList(function (err, joinList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinList.length, 7);
                return done();
            });
        });

        it('Get join list by Journey', function (done) {
            var join = new Join();
            join.getByJourney(2, function (err, joinList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinList.length, 2);
                join.getByJourney(3, function (err, joinList) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(joinList.length, 0);
                    join.getByJourney(1, function (err, joinList) {
                        if (err) return done(err);
                        assert.isNull(err);
                        assert.equal(joinList.length, 1);
                        assert.equal(joinList[0].id, 1);
                        assert.equal(joinList[0].nb_place_outward, 2);
                        assert.equal(joinList[0].nb_place_return, 2);
                        join.getByJourney(-1, function (err, joinList) {
                            assert.isNotNull(err);
                            return done();
                        });
                    });
                });
            });
        });

        it('Get join list by user', function (done) {
            var join = new Join();
            join.getByUser(1, function (err, joinList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinList.length, 1);
                join.getByUser(2, function (err, joinList) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(joinList.length, 2);
                    assert.equal(joinList[1].id, 5);
                    assert.equal(joinList[1].nb_place_outward, 1);
                    assert.isNull(joinList[1].nb_place_return);
                    join.getByUser(-1, function (err, joinList) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });

        it('Get join list by id', function (done) {
            var join = new Join();
            join.getById(4, function (err, joinInfo) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinInfo.id, 4);
                assert.equal(joinInfo.nb_place_outward, 1);
                assert.equal(joinInfo.nb_place_return, 1);
                join.getById(-1, function (err, joinInfo) {
                    assert.isNotNull(err);
                    assert.isNull(joinInfo);
                    return done();
                });
            });
        });

        it('Create a new Join', function (done) {
           var join = new Join(),
               newJoin = {
                    id: 8,
                    nb_place_outward: 3,
                    nb_place_return: 2,
                    journey_id: 3
               },
               user = {
                   'id': 1
               };
            join.set({});
            join.set(newJoin);
            join.setJourney(newJoin.journey_id);
            join.setUser(user);
            var tmp = join.get();
            assert.equal(tmp.id, 8);
            assert.equal(tmp.nb_place_outward, 3);
            assert.equal(tmp.nb_place_return, 2);
            join.save(tmp, user, function (err, createdJoin) {
                assert.isNull(err);
                join.getList(function (err, joinList) {
                    assert.isNull(err);
                    assert.equal(joinList.length, 8);
                    join.getById(8, function (err, joinInfo) {
                        assert.isNull(err);
                        assert.equal(joinInfo.id, 8);
                        assert.equal(joinInfo.nb_place_outward, 3);
                        assert.equal(joinInfo.nb_place_return, 2);
                        return done();
                    });
                });
            });
        });

        it('Cancel join by id', function (done) {
            var join = new Join(),
                invoice = new Invoice(),
                inbox = new Inbox(),
                user = { id: 2 },
                driver = { id: 1 };
            join.cancelById(2, user, true)
                .then(function (joinInfo) {
                    invoice.getById(2, function (err, invoiceInfo) {
                        if (err) return done(err);
                        assert.isNull(err);
                        assert.equal(invoiceInfo.status, 'cancelled');
                        inbox.getList(user, function (err, messages) {
                            if (err) return done(err);
                            assert.equal(messages.length, 3);
                            assert.include(messages[0].message, 'Cancel participation trajet Les templiers');
                            assert.include(messages[0].title, 'Les templiers');
                            inbox.getList(driver, function (err, messages) {
                                if (err) return done(err);
                                assert.equal(messages.length, 3);
                                assert.include(messages[0].message, 'User cancel trajet Les templiers');
                                assert.include(messages[0].title, 'Les templiers');
                                return done();
                            });
                        });
                    });
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Cancel not existing join', function (done) {
            var join = new Join(),
                user = { id: 1 };
            join.cancelById(42, user, true)
                .then(function (joinInfo) {
                    return done(new Error('Should be an error'));
                })
                .catch(function (err) {
                    assert.isNotNull(err);
                    return done();
                });
        });

        it('List all join to refund', function (done) {
            var join = new Join();

            join.toRefund()
                .then(function (joinList) {
                    assert.equal(joinList.length, 1);
                    assert.equal(joinList[0].id, 7);
                    assert.equal(joinList[0].User.email, 'toto.titi@tata.fr');
                    assert.equal(joinList[0].Journey.address_start, 'Nantes, France');
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Refund the join to refund', function (done) {
            var join = new Join();

            join.refund(7)
                .then(function (updatedInvoice) {
                    assert.equal(updatedInvoice.id, 7);
                    assert.equal(updatedInvoice.status, 'refunded');
                    join.toRefund()
                        .then(function (joinList) {
                            assert.equal(joinList.length, 0);
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
    });
    describe('Test with mock', function () {
        describe('Test save', function () {
            it('Should save join which fail to setUser', function (done) {
                var stubModel = { Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Join: { create: function (params) { var deferred = q.defer(); deferred.resolve(
                                        {   setJourney: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                                            setUser: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                                    ); return deferred.promise; } } };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel});
                var join = new Join();
                join.save({id: 1, journey_id: 1}, {id: 1}, function (err, msg) {
                    if (err) {
                        assert.isNull(msg);
                        assert.include(err, 'Mock to fail');
                        return done();
                    }
                    return done('Should not create join !');
                });
            });
        });
        describe('Test getList', function () {
            it('Should get list of joins which fail to find all', function (done) {
                var stubModel = { Join: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel});
                var join = new Join();
                join.getList(function (err, msg) {
                    if (err) {
                        assert.isNull(msg);
                        assert.include(err, 'Mock to fail');
                        return done();
                    }
                    return done('Should not get join list !');
                });
            });
        });
        describe('Test toRefund', function () {
            it('Should get list of joins to refund which fail to find all', function (done) {
                var stubModel = { Join: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel});
                var join = new Join();
                join.toRefund()
                    .then(function (list) {
                        return done('Should not list join to refund !');
                    })
                    .catch(function (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test refund', function () {
            it('Should refund the join which fail to find all join', function (done) {
                var stubModel = { Join: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel});
                var join = new Join();
                join.refund(3)
                    .then(function (list) {
                        return done('Should not refund the join !');
                    })
                    .catch(function (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    });
            });
            it('Should refund the join which fail to save invoice', function (done) {
                var stubModel = { Join: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    Invoice: {
                        status: 'completed',
                        save: function () { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                    }
                }); return deferred.promise; } } };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel});
                var join = new Join();
                join.refund(3)
                    .then(function (list) {
                        return done('Should not refund the join !');
                    })
                    .catch(function (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test cancelById', function () {
            it('Should cancel join by id which fail to find join', function (done) {
                var stubModel = { Join: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel});
                var join = new Join();
                join.cancelById(1, {id: 2}, true)
                    .then(function (list) {
                        return done('Should not cancel the join !');
                    })
                    .catch(function (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    });
            });
            it('Should cancel join by id which fail to update invoice status', function (done) {
                var stubModel = { Join: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Invoice: {id: 1}, Journey: {id: 1, Run: {name: 'toto'}, UserId: 5}}); return deferred.promise; } } };
                var stubInvoice = function invoice() {};
                stubInvoice.prototype.updateStatus = function (id, status, callback) { return callback('Mock to fail', null); };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel, './invoice': stubInvoice, './inbox': stubInbox});
                var join = new Join();
                join.cancelById(1, {id: 2}, true)
                    .then(function (list) {
                        return done('Should not cancel the join !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should cancel join by id which fail to add message to driver inbox', function (done) {
                var stubModel = { Join: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Invoice: {id: 1}, Journey: {id: 1, Run: {name: 'toto'}, UserId: 5}}); return deferred.promise; } } };
                var stubInvoice = function invoice() {};
                stubInvoice.prototype.updateStatus = function (id, status, callback) { return callback(null, {id: 1}); };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel, './invoice': stubInvoice, './inbox': stubInbox});
                var join = new Join();
                join.cancelById(1, {id: 2}, true)
                    .then(function (list) {
                        return done('Should not cancel the join !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should cancel join by id which fail to add message to user inbox', function (done) {
                var stubModel = { Join: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Invoice: {id: 1}, Journey: {id: 1, Run: {name: 'toto'}, UserId: 5}}); return deferred.promise; } } };
                var stubInvoice = function invoice() {};
                stubInvoice.prototype.updateStatus = function (id, status, callback) { return callback(null, {id: 1}); };
                var rejectCount = 0;
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); if (rejectCount === 0) { deferred.resolve({id: 1}); rejectCount++; } else { deferred.reject('Mock to fail'); } return deferred.promise; };
                var Join = proxyquire('../../server/objects/join', {'../models': stubModel, './invoice': stubInvoice, './inbox': stubInbox});
                var join = new Join();
                join.cancelById(1, {id: 2}, true)
                    .then(function (list) {
                        return done('Should not cancel the join !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
    });
});