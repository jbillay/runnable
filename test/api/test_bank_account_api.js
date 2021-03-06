/**
 * Created by jeremy on 04/02/15.
 */
'use strict';

var request = require('supertest'),
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

describe('Test of bank_account API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of API bank account over !');
    });
	
	describe('GET /api/user/bankaccount', function () {
		var agent = superagent.agent();
        before(loginUser(agent));
		
		it('should return current user bank account', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/user/bankaccount')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.owner, 'Jeremy Billay');
                    assert.equal(res.body.agency_name, 'Crédit Agricole');
                    assert.equal(res.body.IBAN, 'FR7618206000576025840255308');
                    assert.equal(res.body.BIC, 'AGRIFRPP882');
                    return done();
                });
        });
    });

	describe('GET /api/admin/user/bankaccount/:id', function () {
		var agent = superagent.agent();

        before(loginUser(agent));

		it('should return a selected user bank account', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/user/bankaccount/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.owner, 'Richard Couret');
                    assert.equal(res.body.agency_name, 'CIC');
                    assert.equal(res.body.IBAN, 'TESTIBAN');
                    assert.equal(res.body.BIC, 'TESTBIC');
                    return done();
                });
        });
    });

	describe('POST /api/user/bankaccount', function () {
		var agent = superagent.agent();

        before(loginUser(agent));
		
		it('should return current user bank account', function (done) {
			var account = {
				owner: 'Richard Couret',
				agency_name: 'CIC',
				IBAN: 'FR7618206000576025840200000',
				BIC: 'AGRIFRPP000'
			};
            agent
                .post('http://localhost:' + settings.port + '/api/user/bankaccount')
				.send(account)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.msg, 'bankAccountSaved');
                    return done();
                });
        });
    });
});
	
	