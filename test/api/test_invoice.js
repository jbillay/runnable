/**
 * Created by jeremy on 21/02/15.
 */
/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Invoice = require('../../server/objects/invoice');
var Inbox = require('../../server/objects/inbox');
var settings = require('../../conf/config');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of Invoice object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of invoice over !');
    });

    describe('Test with local database', function () {
        it('Get invoice list by user', function (done) {
            var invoice = new Invoice();
            invoice.getByUser(1, function (err, invoiceList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(invoiceList.length, 1);
                invoice.getByUser(2, function (err, invoiceList) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(invoiceList.length, 2);
                    assert.equal(invoiceList[1].id, 5);
                    assert.equal(invoiceList[1].status, 'completed');
                    assert.equal(invoiceList[1].amount, 12.49);
                    assert.equal(invoiceList[1].fees, 2.49);
                    invoice.getByUser(-1, function (err, invoiceList) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });

        it('Get invoice by id', function (done) {
            var invoice = new Invoice();
            invoice.getById(4, function (err, invoiceInfo) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(invoiceInfo.id, 4);
                assert.equal(invoiceInfo.status, 'pending');
                assert.equal(invoiceInfo.amount, 23.75);
                assert.equal(invoiceInfo.fees, 3.75);
                assert.equal(invoiceInfo.ref, 'MRT20150217H36EG');
                invoice.getById(-1, function (err, invoiceInfo) {
                    assert.isNotNull(err);
                    assert.isNull(invoiceInfo);
                    return done();
                });
            });
        });

        it('Get invoice by driver', function (done) {
            var invoice = new Invoice();
            invoice.getByDriver(1, function (err, invoiceInfo) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(invoiceInfo.length, 4);
                return done();
            });
        });

        it('Create a new Invoice', function (done) {
            var invoice = new Invoice(),
                inbox = new Inbox(),
                newInvoice = {
                    id: 8,
                    status: 'pending',
                    amount: 38.83,
                    fees: 8.83,
                    ref: 'MRT2015021728IKD',
                    transaction: '83V29469P1887825P',
                    driver_payed: true,
                    journey_id: 3,
                    join_id: 1
                },
                user = {
                    'id': 1
                };
            invoice.set({});
            invoice.set(newInvoice);
            invoice.setJourney(newInvoice.journey_id);
            invoice.setJoin(newInvoice.join_id);
            invoice.setUser(user);
            var tmp = invoice.get();
            assert.equal(tmp.id, 8);
            assert.equal(tmp.status, 'pending');
            assert.equal(tmp.amount, 38.83);
            assert.equal(tmp.fees, 8.83);
            assert.equal(tmp.ref, 'MRT2015021728IKD');
            assert.equal(tmp.transaction, '83V29469P1887825P');
            assert.equal(tmp.driver_payed, true);
            invoice.save(tmp, user, function (err, createdInvoice) {
                if (err) return done(err);
                assert.isNull(err);
                invoice.getById(8, function (err, invoiceInfo) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(invoiceInfo.id, 8);
                    assert.equal(invoiceInfo.status, 'pending');
                    assert.equal(invoiceInfo.amount, 38.83);
                    assert.equal(invoiceInfo.fees, 8.83);
                    assert.equal(invoiceInfo.ref, 'MRT2015021728IKD');
                    assert.equal(invoiceInfo.transaction, '83V29469P1887825P');
                    assert.equal(invoiceInfo.driver_payed, true);
                    inbox.getList(user, function (err, messages) {
                        if (err) return done(err);
                        assert.equal(messages.length, 3);
                        assert.include(messages[0].message, 'User join a journey for Corrida de Saint Germain en Laye');
                        assert.include(messages[0].title, 'Corrida de Saint Germain en Laye');
                        return done();
                    });
                });
            });
        });

        it('Update payment information', function (done) {
            var invoice = new Invoice(),
                ipn = {
                    ref: 'MRT20150217JZL8D',
                    amount: 50.96,
                    status: 'completed',
                    transaction: '83V29469P1887825P'
                };
            invoice.updatePaymentStatus(ipn.ref, ipn.amount, ipn.status, ipn.transaction, function (err, msg) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.isNull(err);
                invoice.getById(2, function (err, invoiceInfo) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    assert.isNull(err);
                    assert.equal(invoiceInfo.id, 2);
                    assert.equal(invoiceInfo.status, 'completed');
                    assert.equal(invoiceInfo.amount, 50.96);
                    assert.equal(invoiceInfo.ref, 'MRT20150217JZL8D');
                    assert.equal(invoiceInfo.transaction, '83V29469P1887825P');
                    return done();
                });
            });
        });

        it('Try to update payment where amount different', function (done) {
            var invoice = new Invoice(),
                ipn = {
                    ref: 'MRT20150217JZL8D',
                    amount: 50,
                    status: 'completed',
                    transaction: '83V29469P1887825P'
                };
            invoice.updatePaymentStatus(ipn.ref, ipn.amount, ipn.status, ipn.transaction, function (err, msg) {
                assert.isNotNull(err);
                return done();
            });
        });

        it('Update invoice status to cancelled', function (done) {
            var invoice = new Invoice();
            invoice.updateStatus(2, 'cancelled', function (err, msg) {
                if (err) return done(err);
                assert.isNull(err);
                invoice.getById(2, function (err, invoiceInfo) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(invoiceInfo.status, 'cancelled');
                    return done();
                });
            });
        });
    });
    describe('Test with mock', function () {
        describe('Test save', function () {
            it('Should save invoice which fail to set user', function (done) {
                var stubModel = { Invoice: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                    setUser: function (user) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; },
                    setJoin: function (join) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                    setJourney: function (journey) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; }
                }); return deferred.promise; } },
                                    User: { find: function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Join: { find: function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Journey: { find:  function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } } };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel});
                var invoice = new Invoice();
                invoice.save({id: 2, join_id: 3, journey_id: 1}, {id: 1}, function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
            it('Should save invoice which fail to add message to inbox', function (done) {
                var stubModel = { Invoice: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                    setUser: function (user) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                    setJoin: function (join) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                    setJourney: function (journey) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; }
                }); return deferred.promise; } },
                                    User: { find: function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Join: { find: function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Journey: { find:  function () { var deferred = q.defer(); deferred.resolve({id: 1, Run: { name: 'toto'}}); return deferred.promise; } } };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel, './inbox': stubInbox});
                var invoice = new Invoice();
                invoice.save({id: 2, join_id: 3, journey_id: 1}, {id: 1}, function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
        });
        describe('Test getByDriver', function () {
            it('Should get by driver invoice which fail to get journey list', function (done) {
                var stubModel = { Invoice: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; } },
                                    Journey: { findAll:  function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel});
                var invoice = new Invoice();
                invoice.getByDriver(1, function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
            it('Should get by driver invoice which fail to get Invoice list', function (done) {
                var stubModel = { Invoice: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } },
                                    Journey: { findAll:  function (params) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; } } };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel});
                var invoice = new Invoice();
                invoice.getByDriver(1, function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
        });
        describe('Test updateStatus', function () {
            it('Should update invoice status which fail to save invoice', function (done) {
                var stubModel = { Invoice: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    status: 'pending',
                    save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel});
                var invoice = new Invoice();
                invoice.updateStatus(1, 'completed', function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
            it('Should update invoice status which fail to get invoice', function (done) {
                var stubModel = { Invoice: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel});
                var invoice = new Invoice();
                invoice.updateStatus(1, 'completed', function (err, msg) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
        });
        describe('Test updatePaymentStatus', function () {
            it('Should update invoice payment status which fail to save invoice', function (done) {
                var stubModel = { Invoice: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    status: 'pending',
                    amount: 15,
                    save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel});
                var invoice = new Invoice();
                invoice.updatePaymentStatus('LJDEII12', 15, 'completed', '', function (err, msg) {
                    if (err) {
                        console.log(err);
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
            it('Should update invoice payment status which fail to get invoice', function (done) {
                var stubModel = { Invoice: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Invoice = proxyquire('../../server/objects/invoice', {'../models': stubModel});
                var invoice = new Invoice();
                invoice.updatePaymentStatus('LJDEII12', 15, 'completed', '', function (err, msg) {
                    if (err) {
                        console.log(err);
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    } else {
                        return done('Should add message');
                    }
                });
            });
        });
    });
});