/**
 * Created by jeremy on 27/05/15.
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

describe('Test of option API', function () {

    // Recreate the database after each test to ensure isolation
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
                        var fixtures = require('./fixtures/options.json');
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
        console.log('Test API option over !');
    });

    describe('GET /get/option/:name', function () {
        var agent = superagent.agent(),
			mailData = {host: 'mail.gmail.com', user: 'jbillay@gmail.com', password: 'test', transport: 'SMTP', from: 'Service des ventes Inside Pole <ventes@insidepole.fr>', to: 'ventes@insidepole.fr', bcc: 'jbillay@gmail.com', send: false};
        before(loginUser(agent));

        it('should get emailConfig value', function (done) {
            agent
                .get('http://localhost:9615/get/option/mailConfig')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
					assert.deepEqual(res.body, mailData);
                    return done();
                });
        });
    });

    describe('GET /get/options', function () {
        var agent = superagent.agent(),
            mailData = {host: 'mail.gmail.com', user: 'jbillay@gmail.com', password: 'test', transport: 'SMTP', from: 'Service des ventes Inside Pole <ventes@insidepole.fr>', to: 'ventes@insidepole.fr', bcc: 'jbillay@gmail.com', send: false};
        before(loginUser(agent));

        it('should get all option values', function (done) {
            agent
                .get('http://localhost:9615/get/options')
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

    describe('POST /set/options', function () {
        var agent = superagent.agent();
		
        before(loginUser(agent));

        it('should save options values', function (done) {
            var optionData = [],
				mailData = {host: 'mail.ovh.com', user: 'jbillay@gmail.com', password: 'noofs', transport: 'SMTP', from: 'My Run Trip <postmaster@myruntrip.com>', to: 'postmaster@myruntrip.com', bcc: 'jbillay@gmail.com'},
				templateData = [{id: 0, name: 'Test', key: ['articleName', 'stockDate'], html: 'TEST Out of stock HTML', text: 'TEST Out of Stock TEXT'},
                    {id: 1, name: 'Tracking Generic', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST BDD', text: 'TEST Tracking Generic TEXT'},
                    {id: 3, name: 'Tracking Xpole', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST'}];
			optionData.push(mailData);
			optionData.push(templateData);
			
            agent
                .post('http://localhost:9615/set/options')
                .send(optionData)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    // Waiting 300 ms in order to finalized the update of values - maybe better to use bulkCreate in save
					setTimeout(function(){ agent
						.get('http://localhost:9615/get/options')
						.end(function (err, res) {
							if (err) {
								return done(err);
							}
							var obj = JSON.parse(JSON.stringify(res.body));
							assert.equal(Object.keys(obj).length, 2);
							assert.deepEqual(obj.mailConfig, mailData);
							return done();
						}); }, 300);
                });
        });
    });
});
