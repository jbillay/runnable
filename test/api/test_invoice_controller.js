/**
 * Created by jeremy on 11/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Invoice = require('../../server/controllers/invoice');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of invoice controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of invoice controller is over !');
    });

    describe('Test getByUser', function () {
        it('Should get invoices for a user with success', function (done) {
            var stub = function invoice() {};
            stub.prototype.getByUser = function (id, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Invoice.getByUser(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get invoices for a user which failed', function (done) {
            var stub = function invoice() {};
            stub.prototype.getByUser = function (id, callback) { callback('Mock to fail', null); };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Invoice.getByUser(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test getByDriver', function () {
        it('Should get invoices for a driver with success', function (done) {
            var stub = function invoice() {};
            stub.prototype.getByDriver = function (id, callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Invoice.getByDriver(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get invoices for a driver which failed', function (done) {
            var stub = function invoice() {};
            stub.prototype.getByDriver = function (id, callback) { callback('Mock to fail', null); };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stub});
            var req = { user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Invoice.getByDriver(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
    describe('Test confirm', function () {
        it('Should complete an invoices for a user from paypal with success', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback(null, { id: 1, status: 'completed', amount: 108.27, fees: 8.27, ref: 'MRT20150217LA6E9', transaction: '', UserId: 1, JourneyId: 1, JoinId: 1}); };
            var stubIPN = { 'verify': function (object, sandbox, callback) { callback(null, {id: 1}); } };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stubInvoice, 'paypal-ipn': stubIPN});
            var req = { body: {
                    payment_status: 'completed',
                    mc_gross: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.confirm(req, res, spyNext);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.invoice.id, 1);
            assert.equal(req.invoice.status, 'completed');
            assert.equal(req.invoice.amount, 108.27);
            assert.equal(req.invoice.fees, 8.27);
            assert.equal(req.invoice.ref, 'MRT20150217LA6E9');
            assert.equal(req.invoice.transaction, '');
            assert.equal(req.invoice.UserId, 1);
            assert.equal(req.invoice.JourneyId, 1);
            assert.equal(req.invoice.JoinId, 1);
            return done();
        });

        it('Should complete an invoices for a user from paypal which failed', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { return callback('Mock to fail', null); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, value, email) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
            var stubIPN = { 'verify': function (object, sandbox, callback) { return callback('Mock to fail', null); } };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stubInvoice, '../objects/mail': stubMail, 'paypal-ipn': stubIPN});
            var req = { body: {
                    payment_status: 'completed',
                    amount: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.confirm(req, res, spyNext);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.invoice);
            return done();
        });

        it('Should complete an invoices for a user from paypal which failed to send error message', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback('Mock to fail', null); };
            var stubMail = function mail() {};
            stubMail.prototype.sendEmail = function (template, value, email) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
            var stubIPN = { 'verify': function (object, sandbox, callback) { callback('Mock to fail', null); } };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stubInvoice, '../objects/mail': stubMail, 'paypal-ipn': stubIPN});
            var req = { body: {
                    payment_status: 'completed',
                    amount: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.confirm(req, res, spyNext);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.invoice);
            return done();
        });

        it('Should update status of an invoices fail for a user validated in paypal with success', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback('Mock to fail', null); };
            var stubIPN = { 'verify': function (object, sandbox, callback) { callback(null, {id: 1}); } };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stubInvoice, 'paypal-ipn': stubIPN});
            var req = { body: {
                    payment_status: 'pending',
                    amount: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.confirm(req, res, spyNext);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.invoice);
            return done();
        });

        it('Should pending an invoices for a user from paypal with success', function (done) {
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback(null, { id: 1, status: 'pending', amount: 108.27, fees: 8.27, ref: 'MRT20150217LA6E9', transaction: '', UserId: 1, JourneyId: 1, JoinId: 1}); };
            var stubIPN = { 'verify': function (object, sandbox, callback) { callback(null, {id: 1}); } };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stubInvoice, 'paypal-ipn': stubIPN});
            var req = { body: {
                    payment_status: 'pending',
                    mc_gross: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.confirm(req, res, spyNext);
            assert.isTrue(spyNext.withArgs('route').calledOnce);
            assert.isUndefined(req.invoice);
            return done();
        });

        it('Should update status of an invoices fail for a user validated in paypal in prod with success', function (done) {
            process.env.NODE_ENV = 'production';
            var stubInvoice = function invoice() {};
            stubInvoice.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback('Mock to fail', null); };
            var stubIPN = { 'verify': function (object, sandbox, callback) { assert.deepEqual(sandbox, {allow_sandbox: false}); callback(null, {id: 1}); } };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stubInvoice, 'paypal-ipn': stubIPN});
            var req = { body: {
                    payment_status: 'pending',
                    amount: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.confirm(req, res, spyNext);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.invoice);
            process.env.NODE_ENV = 'test';
            return done();
        });
    });
    describe('Test complete', function () {
        it('Should complete an invoices for a user with success', function (done) {
            var stub = function invoice() {};
            stub.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback(null, { id: 1, status: 'completed', amount: 108.27, fees: 8.27, ref: 'MRT20150217LA6E9', transaction: '', UserId: 1, JourneyId: 1, JoinId: 1}); };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stub});
            var req = { body: {
                    payment_status: 'completed',
                    amount: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.complete(req, res, spyNext);
            assert.isTrue(spyNext.calledOnce);
            assert.equal(req.invoice.id, 1);
            assert.equal(req.invoice.status, 'completed');
            assert.equal(req.invoice.amount, 108.27);
            assert.equal(req.invoice.fees, 8.27);
            assert.equal(req.invoice.ref, 'MRT20150217LA6E9');
            assert.equal(req.invoice.transaction, '');
            assert.equal(req.invoice.UserId, 1);
            assert.equal(req.invoice.JourneyId, 1);
            assert.equal(req.invoice.JoinId, 1);
            return done();
        });

        it('Should complete an invoices for a user which failed', function (done) {
            var stub = function invoice() {};
            stub.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback('Mock to fail', null); };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stub});
            var req = { body: {
                    payment_status: 'completed',
                    amount: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.complete(req, res, spyNext);
            assert.isTrue(spyNext.notCalled);
            assert.isUndefined(req.invoice);
            return done();
        });

        it('Should update status of an invoices for a user with success', function (done) {
            var stub = function invoice() {};
            stub.prototype.updatePaymentStatus = function (invoice, amount, status, txn_id, callback) { callback(null, { id: 1, status: 'pending', amount: 108.27, fees: 8.27, ref: 'MRT20150217LA6E9', transaction: '', UserId: 1, JourneyId: 1, JoinId: 1}); };
            var Invoice = proxyquire('../../server/controllers/invoice',
                {'../objects/invoice': stub});
            var req = { body: {
                    payment_status: 'pending',
                    amount: 20,
                    invoice: 'INVOICE56789',
                    txn_id: 'TRANSAC156789'} },
                res = { send: function (status) {} };
            var spyNext = sinon.spy();
            Invoice.complete(req, res, spyNext);
            assert.isTrue(spyNext.withArgs('route').calledOnce);
            assert.isUndefined(req.invoice);
            return done();
        });
    });
});