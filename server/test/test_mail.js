/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../models');
var Mail = require('../objects/mail');
var async = require('async');
var sinon = require('sinon');
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

describe('Tests of mail object', function () {
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
        console.log('Test mail over !');
        done();
    });

    describe('Test of inbox object', function () {
        it('Test to send an mail with service', function (done) {
            new Mail().then(function (mail) {
                sinon.stub(mail, 'send', function() {
                    assert.equal(this.user, 'jbillay@gmail.com');
                    assert.equal(this.password, 'test');
                    assert.equal(this.text, 'Bonjour');
                });
                mail.setTo('jbillay@gmail.com');
                mail.setSubject('Email des tests unitaires');
                mail.setContentHtml('<h2>Bonjour</h2>h2>');
                mail.setText('Bonjour');
                mail.addAttachment('./fixtures/joins.json');
                mail.send();
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
        });

        it('Test to send an mail with a template', function (done) {
            new Mail().then(function (mail) {
                mail.setTo('jbillay@gmail.com');
                mail.generateContent('ActivationAccount', {url: 'url', timekey: 'timekey', userId: 'toto'})
                    .then(function (mail) {
                        sinon.stub(mail, 'send', function() {
                            assert.equal(this.user, 'jbillay@gmail.com');
                            assert.equal(this.password, 'test');
                            assert.equal(this.subject, 'Email pour user toto');
                            assert.equal(this.text, 'TEST Out of stock toto timekey HTML');
                        });
                        assert.equal(mail.getContentHtml(), 'TEST Out of stock toto timekey HTML');
                        assert.equal(mail.getSubject(), 'Email pour user toto');
                        mail.send();
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            })
            .catch(function (err) {
                return done(err);
            });
        });

        it('Test to send an mail with empty template', function (done) {
            new Mail().then(function (mail) {
                mail.setTo('jbillay@gmail.com');
                mail.generateContent(null, {url: 'url', timekey: 'timekey', userId: 'toto'})
                    .catch(function (err) {
                        assert.isNotNull(err);
                        return done();
                    });
            });
        });

        it('Test to send an mail with wrong template', function (done) {
            new Mail().then(function (mail) {
                mail.setTo('jbillay@gmail.com');
                mail.generateContent('iruotu', {url: 'url', timekey: 'timekey', userId: 'toto'})
                    .catch(function (err) {
                        assert.isNotNull(err);
                        return done();
                    });
            });
        });
    });
});