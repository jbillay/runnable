/**
 * Created by jeremy on 03/02/15.
 */

'use strict';

var assert = require('chai').assert;
var models = require('../models');
var Options = require('../objects/option');
var async = require('async');
var q = require('q');
var request = require('request');

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

describe('Tests of option object', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
		this.timeout(6000);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
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
    after(function (done) {
        console.log('Test option over !');
		done();
    });

    it('Should load options values', function (done) {
        var options = new Options(),
			mailData = {"host": "mail.gmail.com", "user": "jbillay@gmail.com", "password": "test", "transport": "SMTP", "from": "Service des ventes Inside Pole <ventes@insidepole.fr>", "to": "ventes@insidepole.fr", "bcc": "jbillay@gmail.com"},
			templateData = [{"id": 0, "name": "Out of Stock", "key": ["articleName", "stockDate"], "html": "TEST Out of stock HTML", "text": "TEST Out of Stock TEXT"}, {"id": 1, "name": "Tracking Generic", "key": ["deliveryName", "deliveryURL", "trackingNumber"], "html": "TEST Tracking Generic HTML", "text": "TEST Tracking Generic TEXT"}, {"id": 3, "name": "Tracking Xpole", "key": ["deliveryName", "deliveryURL", "trackingNumber"], "html": "TEST"}];
        options.load(function (err, options) {
            if (err) {
                console.log('Error: ' + err);
				return done(err);
            }
            assert.deepEqual(options.getMailConfig(), mailData);
            assert.equal(options.getTemplateId('Out of Stock'), 0);
            assert.equal(options.getEmailTemplate(1), 'TEST Tracking Generic HTML');
            return done();
        });
    });
	
	it('Should save options values', function (done) {
        var options = new Options(),
			optionData = [],
			mailData = {"host": "mail.ovh.com", "user": "jbillay@gmail.com", "password": "noofs", "transport": "SMTP", "from": "My Run Trip <postmaster@myruntrip.com>", "to": "postmaster@myruntrip.com", "bcc": "jbillay@gmail.com"},
			templateData = [{"id": 0, "name": "Test", "key": ["articleName", "stockDate"], "html": "TEST Out of stock HTML", "text": "TEST Out of Stock TEXT"}, {"id": 1, "name": "Tracking Generic", "key": ["deliveryName", "deliveryURL", "trackingNumber"], "html": "TEST BDD", "text": "TEST Tracking Generic TEXT"}, {"id": 3, "name": "Tracking Xpole", "key": ["deliveryName", "deliveryURL", "trackingNumber"], "html": "TEST"}];
		optionData.push(mailData);
		optionData.push(templateData);
        options.save(optionData, function (err, newOptions) {
            if (err) {
                console.log('Error: ' + err);
				return done(err);
            }
			assert.isNotNull(newOptions);
			// Waiting 300 ms in order to finalized the update of values - maybe better to use bulkCreate in save
			setTimeout(function(){ options.load(function (err, newOptions) {
				if (err) {
					console.log('Error: ' + err);
					return done(err);
				}
				assert.deepEqual(newOptions.getMailConfig(), mailData);
				assert.equal(newOptions.getTemplateId('Test'), 0);
				assert.equal(newOptions.getEmailTemplate(1), 'TEST BDD');
				return done();
			}); }, 300);
        });
    });

});