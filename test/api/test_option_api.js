/**
 * Created by jeremy on 27/05/15.
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

describe('Test of option API', function () {

    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API option over !');
    });

    describe('GET /api/admin/options', function () {
        var agent = superagent.agent(),
            mailData = {host: 'mail.gmail.com', user: 'jbillay@gmail.com', password: 'test', transport: 'SMTP', from: 'Service des ventes Inside Pole <ventes@insidepole.fr>', to: 'ventes@insidepole.fr', bcc: 'jbillay@gmail.com', send: false};
        before(loginUser(agent));

        it('should get all option values', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/options')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
					var obj = JSON.parse(JSON.stringify(res.body));
					assert.equal(Object.keys(obj).length, 2);
					assert.deepEqual(obj.mailConfig, mailData);
                    return done();
                });
        });
    });

    describe('GET /api/admin/option/:name', function () {
        var agent = superagent.agent(),
            mailData = {host: 'mail.gmail.com', user: 'jbillay@gmail.com', password: 'test', transport: 'SMTP', from: 'Service des ventes Inside Pole <ventes@insidepole.fr>', to: 'ventes@insidepole.fr', bcc: 'jbillay@gmail.com', send: false};
        before(loginUser(agent));

        it('should get emailConfig value', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/option/mailConfig')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.deepEqual(res.body, mailData);
                    return done();
                });
        });
    });

    describe('POST /api/admin/options', function () {
        var agent = superagent.agent();
		
        before(loginUser(agent));

        it('should save options values', function (done) {
            var optionData = {};
			optionData.mailConfig = {host: 'mail.ovh.com', user: 'jbillay@gmail.com', password: 'noofs', transport: 'SMTP', from: 'My Run Trip <postmaster@myruntrip.com>', to: 'postmaster@myruntrip.com', bcc: 'jbillay@gmail.com', send: false};
			optionData.emailTemplate = [{id: 0, name: 'Test', key: ['articleName', 'stockDate'], html: 'TEST Out of stock HTML', text: 'TEST Out of Stock TEXT'},
                    {id: 1, name: 'Tracking Generic', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST BDD', text: 'TEST Tracking Generic TEXT'},
                    {id: 3, name: 'Tracking Xpole', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST'}];
			
            agent
                .post('http://localhost:' + settings.port + '/api/admin/options')
                .send(optionData)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    // Waiting 300 ms in order to finalized the update of values - maybe better to use bulkCreate in save
					setTimeout(function(){ agent
						.get('http://localhost:' + settings.port + '/api/admin/options')
						.end(function (err, res) {
							if (err) {
								return done(err);
							}
							var obj = JSON.parse(JSON.stringify(res.body));
							assert.equal(Object.keys(obj).length, 2);
							assert.deepEqual(obj.mailConfig, optionData.mailConfig);
							return done();
						}); }, 300);
                });
        });
    });
});
