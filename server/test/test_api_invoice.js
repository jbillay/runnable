/**
 * Created by jeremy on 21/02/15.
 */

'use strict';

var request = require('supertest'),
    models = require('../models'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    async = require('async'),
    q = require('q'),
    superagent = require('superagent');

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

function loginUser(agent) {
    return function(done) {
        function onResponse(err, res) {
            return done();
        }

        agent
            .post('http://localhost:9615/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);
    };
}

describe('Test of invoice API', function () {
    // Recreate the database after each test to ensure isolation
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
                        var fixtures = require('./fixtures/discussions.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/participates.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
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
        console.log('Test API invoice over !');
    });

    describe('GET /api/invoice', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of invoice by user', function(done) {
            agent
                .get('http://localhost:9615/api/invoice')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/invoice/driver', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of invoice by driver', function(done) {
            agent
                .get('http://localhost:9615/api/invoice/driver')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('POST /api/paypal/ipn', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return code 200', function (done) {
            request(app)
                .post('/api/paypal/ipn')
                .expect(200, done);
        });

        /* Couldn't be tested as we don't know Paypal behavior
         it('should update the payment for join 2', function (done) {
         var ipn = {
         mc_gross: '50.96', // AMOUNT
         invoice: 'MRT20150217JZL8D', // INVOICE
         protection_eligibility: 'Eligible',
         address_status: 'confirmed',
         payer_id: 'TWD3EPNPY3YKQ',
         tax: '0.00',
         address_street: '1 Main St',
         payment_date: '06:25:17 Feb 16, 2015 PST',
         payment_status: 'Completed', // IMPORTANT STATUS PAYEMENT
         charset: 'windows-1252',
         address_zip: '95131',
         first_name: 'test',
         mc_fee: '1.83',
         address_country_code: 'US',
         address_name: 'test buyer',
         notify_version: '3.8',
         custom: '',
         payer_status: 'verified',
         business: 'jbillay-facilitator@gmail.com',
         address_country: 'United States',
         address_city: 'San Jose',
         quantity: '1',
         verify_sign: 'AARfy1T5ympFszI-LDzRxLr7PDA0Ay41NpKSmXupFLbgmHrGTiFzkPjN',
         payer_email: 'jbillay-buyer@gmail.com', // EMAIL CLIENT
         txn_id: '83V29469P1887825P', // TRANSACTION ID
         payment_type: 'instant',
         last_name: 'buyer',
         address_state: 'CA',
         receiver_email: 'jbillay-facilitator@gmail.com',
         payment_fee: '',
         receiver_id: '622WFSZHPNBH4',
         txn_type: 'web_accept',
         item_name: 'Parcours My Run Trip',
         mc_currency: 'EUR',
         item_number: '',
         residence_country: 'US',
         test_ipn: '1',
         handling_amount: '0.00',
         transaction_subject: '',
         payment_gross: '',
         shipping: '0.00',
         ipn_track_id: 'b959e24b7e596' };

         agent
         .post('http://localhost:9615/api/paypal/ipn')
         .send(ipn)
         .end(function (err, res) {
         if (err) {
         console.log(err);
         return done(err);
         }
         console.log(res);
         agent
         .get('http://localhost:9615/api/join/2')
         .end(function (err, res) {
         if (err) {
         console.log(err);
         return done(err);
         }
         console.log(res.body);
         assert.equal(res.body.status, 'complete');
         assert.equal(res.body.amount, 50.96);
         assert.equal(res.body.invoice, 'MRT20150217JZL8D');
         assert.equal(res.body.transaction, '83V29469P1887825P');
         return done();
         });
         });
         });*/
    });
});
