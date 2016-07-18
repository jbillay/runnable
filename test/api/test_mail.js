/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Mail = require('../../server/objects/mail');
var sinon = require('sinon');
var settings = require('../../conf/config');
var request = require('request');

describe('Tests of mail object', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function (done) {
        console.log('Test mail over !');
        done();
    });

    describe('Test of inbox object', function () {
        it('Test to send an mail with service', function (done) {
            var mail = new Mail();
            mail.init().then(function () {
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
                // not in promise as function stub to check content
                mail.send();
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
        });

        it('Test to send an mail with a template', function (done) {
            var mail = new Mail();
            mail.init().then(function () {
                mail.setTo('jbillay@gmail.com');
                mail.generateContent('ActivationAccount', {url: 'url', timekey: 'timekey', userId: 'toto'})
                    .then(function (mail) {
                        sinon.stub(mail, 'send', function() {
                            assert.equal(this.user, 'jbillay@gmail.com');
                            assert.equal(this.password, 'test');
                            assert.equal(this.subject, 'Email pour user toto');
                            assert.equal(this.text, 'TEST Out of stock toto timekey HTML');
                        });
                        assert.equal(mail.getContentHtml(), '<HTML> TEST Out of stock toto timekey HTML </HTML>');
                        assert.equal(mail.getSubject(), 'Email pour user toto');
                        // not in promise as function stub to check content
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
            var mail = new Mail();
            mail.init().then(function () {
                mail.setTo('jbillay@gmail.com');
                mail.generateContent(null, {url: 'url', timekey: 'timekey', userId: 'toto'})
                    .catch(function (err) {
                        assert.isNotNull(err);
                        return done();
                    });
            });
        });

        it('Test to send an mail with wrong template', function (done) {
            var mail = new Mail();
            mail.init().then(function () {
                mail.setTo('jbillay@gmail.com');
                mail.generateContent('iruotu', {url: 'url', timekey: 'timekey', userId: 'toto'})
                    .catch(function (err) {
                        assert.isNotNull(err);
                        return done();
                    });
            });
        });

        it('Send an email to check promise of send function', function (done) {
            var mail = new Mail();
            mail.init().then(function () {
                mail.setTo('jbillay@gmail.com');
                mail.generateContent('ActivationAccount', {url: 'url', timekey: 'timekey', userId: 'toto'})
                    .then(function () {
                        mail.send()
                            .then(function (res) {
                                assert.include(res, 'sent');
                                return done();
                            })
                            .catch(function (err) {
                                return done(err);
                            });
                    });
            });
        });

        it('Check email sent with one call', function (done) {
            var mail = new Mail();
            mail.sendEmail('ActivationAccount', {url: 'url', timekey: 'timekey', userId: 'toto'}, 'jbillay@gmail.com')
                .then(function (res) {
                    assert.include(res, 'sent');
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
    });
});