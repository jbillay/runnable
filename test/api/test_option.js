/**
 * Created by jeremy on 03/02/15.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Options = require('../../server/objects/option');
var settings = require('../../conf/config');
var request = require('request');
var proxyquire = require('proxyquire');
var q = require('q');
var sinon = require('sinon');

describe('Tests of option object', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function (done) {
        console.log('Test option over !');
		done();
    });

    describe('Test with local database', function () {
        it('Should load options values', function (done) {
            var options = new Options(),
                mailConfig = {host: 'mail.gmail.com', user: 'jbillay@gmail.com', password: 'test', transport: 'SMTP', from: 'Service des ventes Inside Pole <ventes@insidepole.fr>', to: 'ventes@insidepole.fr', bcc: 'jbillay@gmail.com', send: false, template: '<HTML> {{content}} </HTML>'};
            options.load(function (err, options) {
                if (err) {
                    console.log('Error: ' + err);
                    return done(err);
                }
                assert.deepEqual(options.getMailConfig(), mailConfig);
                assert.equal(options.getTemplateId('Out of Stock'), null);
                assert.equal(options.getTemplateId('ActivationAccount'), 0);
                assert.equal(options.getEmailTemplate(1), 'TEST Tracking Generic HTML');
                return done();
            });
        });

        it('Should get mailConfig option value', function (done) {
            var options = new Options(),
                mailConfig = {host: 'mail.gmail.com', user: 'jbillay@gmail.com', password: 'test', transport: 'SMTP', from: 'Service des ventes Inside Pole <ventes@insidepole.fr>', to: 'ventes@insidepole.fr', bcc: 'jbillay@gmail.com', send: false, template: '<HTML> {{content}} </HTML>'};
            options.get('mailConfig')
                .then(function (value) {
                    assert.deepEqual(value, mailConfig);
                    return done();
                })
                .catch(function (err) {
                    console.log('Error: ' + err);
                    return done (err);
                });
        });

        it('Should save options values', function (done) {
            var options = new Options(),
                optionData = {};
            optionData.mailConfig = {host: 'mail.gmail.com', user: 'jbillay@gmail.com', password: 'noofs', transport: 'SMTP', from: 'My Run Trip <postmaster@myruntrip.com>', to: 'postmaster@myruntrip.com', bcc: 'jbillay@gmail.com'};
            optionData.emailTemplate = [{id: 0, name: 'Test', key: ['articleName', 'stockDate'], html: 'TEST Out of stock HTML', text: 'TEST Out of Stock TEXT'},
                    {id: 1, name: 'Tracking Generic', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST BDD', text: 'TEST Tracking Generic TEXT'},
                    {id: 3, name: 'Tracking Xpole', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST'}];
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
                    assert.deepEqual(newOptions.getMailConfig(), optionData.mailConfig);
                    assert.equal(newOptions.getTemplateId('Test'), 0);
                    assert.equal(newOptions.getEmailTemplate(1), 'TEST BDD');
                    return done();
                }); }, 300);
            });
        });
    });
    describe('Test with mock', function () {
        describe('Test load', function () {
            it('Should load options which fail to get options', function (done) {
                var stub = { Options: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Options = proxyquire('../../server/objects/option', {'../models': stub});
                var options = new Options();
                options.load(function (err, options) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not get options !');
                    }
                });
            });
        });
        describe('Test get', function () {
            it('Should get one option which fail to get option', function (done) {
                var stub = { Options: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Options = proxyquire('../../server/objects/option', {'../models': stub});
                var options = new Options();
                options.get('test')
                    .then(function () {
                        return done('Should not get options !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should get one option which fail as option not found', function (done) {
                var stub = { Options: { find: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; } } };
                var Options = proxyquire('../../server/objects/option', {'../models': stub});
                var options = new Options();
                options.get('test')
                    .then(function () {
                        return done('Should not get options !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Option not found');
                        return done();
                    });
            });
        });
        describe('Test save', function () {
            it('Should save options which fail to get options', function (done) {
                var stub = { Options: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Options = proxyquire('../../server/objects/option', {'../models': stub});
                var options = new Options();
                options.save({mailConfig: {id: 1}, emailTemplate: {id: 2}}, function (err, options) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not get options !');
                    }
                });
            });
            it('Should save options which fail to update attributes', function (done) {
                var spyConsole = sinon.spy(console, 'log');
                var stub = { Options: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([
                    {name: 'mailConfig', updateAttributes: function (option) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } },
                    {name: 'emailTemplate', updateAttributes: function (option) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }}
                ]); return deferred.promise; } } };
                var Options = proxyquire('../../server/objects/option', {'../models': stub});
                var options = new Options();
                options.save({mailConfig: {id: 1}, emailTemplate: {id: 2}}, function (err, options) {
                    if (err) {
                        return done(err);
                    } else {
                        setTimeout(function () {
                            console.log.restore();
                            assert.isNotNull(options);
                            assert.equal(spyConsole.callCount, 2);
                            assert.equal(spyConsole.lastCall.args[0].toString(), 'No able to save option emailTemplate due to Mock to fail');
                            return done();
                        }, 200);
                    }
                });
            });
        });
    });
});