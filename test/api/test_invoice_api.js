/**
 * Created by jeremy on 21/02/15.
 */

'use strict';

process.env.NODE_ENV = 'test';

var request = require('supertest'),
    qs = require('querystring'),
    models = require('../../server/models/index'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    settings = require('../../conf/config'),
    superagent = require('superagent');

function loginUser(agent) {
    return function(done) {
        function onResponse(err, res) {
            return done();
        }

        agent
            .post('http://localhost:' + settings.port + '/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);
    };
}

describe('Test of invoice API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
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
                .get('http://localhost:' + settings.port + '/api/invoice')
                .end(function (err, res) {
                    assert.equal(res.body.length, 1);
                    return done();
                });
        });
    });

    describe('GET /api/invoice/driver', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of invoice by driver', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/invoice/driver')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 4);
                    return done();
                });
        });
    });

    describe('POST /api/admin/invoice/complete', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should complete an order', function(done) {
            var data = {
                amount: 50.96,
                payment_status: 'completed',
                txn_id: 'KLJQLSDJLQSJLL3LAJ342',
                invoice: 'MRT20150217JZL8D'
            };

            agent
                .post('http://localhost:' + settings.port + '/api/admin/invoice/complete')
                .send(data)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.statusCode, 200);
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

        it('should return match the message', function (done) {
            var message = 'mc_gross=19.95&protection_eligibility=Eligible&address_status=confirmed&payer_id=LPLWNMTBWMFAY&tax=0.00&address_street=1+Main+St&payment_date=20%3A12%3A59+Jan+13%2C+2009+PST&payment_status=Completed&charset=windows-1252&address_zip=95131&first_name=Test&mc_fee=0.88&address_country_code=US&address_name=Test+User&notify_version=2.6&custom=&payer_status=verified&address_country=United+States&address_city=San+Jose&quantity=1&verify_sign=AtkOfCXbDm2hu0ZELryHFjY-Vb7PAUvS6nMXgysbElEn9v-1XcmSoGtf&payer_email=gpmac_1231902590_per%40paypal.com&txn_id=61E67681CH3238416&payment_type=instant&last_name=User&address_state=CA&receiver_email=gpmac_1231902686_biz%40paypal.com&payment_fee=0.88&receiver_id=S8XGHLYDW9T3S&txn_type=express_checkout&item_name=&mc_currency=USD&item_number=&residence_country=US&test_ipn=1&handling_amount=0.00&transaction_subject=&payment_gross=19.95&shipping=0.00';

            var ipn = qs.parse(message);

            agent
                .post('http://localhost:' + settings.port + '/api/paypal/ipn')
                .send(ipn)
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.statusCode, 200);
                    setTimeout(function () {
                        agent
                            .post('http://localhost:' + settings.port + '/api/paypal/ipn')
                            .send('VERIFIED')
                            .end(function (err, res) {
                                if (err) return done(err);
                                // TODO: Be able to test with VERIFIED message sent but nothing fund :)
                                return done();
                            });
                    }, 500);
                });
        });
    });
});
