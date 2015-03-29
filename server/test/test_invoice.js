/**
 * Created by jeremy on 21/02/15.
 */
/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../models');
var Invoice = require('../objects/invoice');
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

describe('Test of Invoice object', function () {
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
                        var fixtures = require('./fixtures/invoices.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/validationJourneys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    }
                ], function (err, result) {
                    return done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of invoice over !');
    });

    it('Get invoice list by user', function (done) {
        var invoice = new Invoice();
        invoice.getByUser(1, function (err, invoiceList) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(invoiceList.length, 2);
            invoice.getByUser(2, function (err, invoiceList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(invoiceList.length, 1);
                assert.equal(invoiceList[0].id, 3);
                assert.equal(invoiceList[0].status, 'completed');
                assert.equal(invoiceList[0].amount, 50.96);
                assert.equal(invoiceList[0].fees, 2.96);
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
            assert.equal(invoiceInfo.length, 2);
            return done();
        });
    });

    it('Create a new Invoice', function (done) {
        var invoice = new Invoice(),
            newInvoice = {
                id: 5,
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
        invoice.set(newInvoice);
        invoice.setJourney(newInvoice.journey_id);
        invoice.setJoin(newInvoice.join_id);
        invoice.setUser(user);
        var tmp = invoice.get();
        assert.equal(tmp.id, 5);
        assert.equal(tmp.status, 'pending');
        assert.equal(tmp.amount, 38.83);
        assert.equal(tmp.fees, 8.83);
        assert.equal(tmp.ref, 'MRT2015021728IKD');
        assert.equal(tmp.transaction, '83V29469P1887825P');
        assert.equal(tmp.driver_payed, true);
        invoice.save(tmp, user, function (err, createdInvoice) {
            if (err) {
                console.log(err);
                return done(err);
            }
            assert.isNull(err);
            invoice.getById(5, function (err, invoiceInfo) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.isNull(err);
                assert.equal(invoiceInfo.id, 5);
                assert.equal(invoiceInfo.status, 'pending');
                assert.equal(invoiceInfo.amount, 38.83);
                assert.equal(invoiceInfo.fees, 8.83);
                assert.equal(invoiceInfo.ref, 'MRT2015021728IKD');
                assert.equal(invoiceInfo.transaction, '83V29469P1887825P');
                assert.equal(invoiceInfo.driver_payed, true);
                return done();
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
});