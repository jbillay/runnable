/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Mail = require('../../server/objects/mail');
var sinon = require('sinon');
var settings = require('../../conf/config');
var request = require('request');
var proxyquire = require('proxyquire');
var q = require('q');

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

    describe('Test with local database', function () {
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
    describe('Test with mock', function () {
        describe('Test init', function () {
            it('Should init email config for gmail service', function (done) {
                var stubOption = function option() {};
                stubOption.prototype.get = function (template, value, id) { var deferred = q.defer(); deferred.resolve({service: 'gmail', user: 'toto', password: 'tata'}); return deferred.promise; };
                var Mail = proxyquire('../../server/objects/mail', {'./option': stubOption});
                var mail = new Mail();
                mail.init()
                    .then(function (res) {
                        assert.equal(res.service, 'gmail');
                        assert.isUndefined(res.host);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
            it('Should init email config without service or host', function (done) {
                var stubOption = function option() {};
                stubOption.prototype.get = function (template, value, id) { var deferred = q.defer(); deferred.resolve({}); return deferred.promise; };
                var Mail = proxyquire('../../server/objects/mail', {'./option': stubOption});
                var mail = new Mail();
                mail.init()
                    .then(function (res) {
                        assert.isUndefined(res.service);
                        assert.isUndefined(res.host);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
        });
        describe('Test send', function () {
            it('Should send email', function (done) {
                var stubOption = function option() {};
                stubOption.prototype.get = function (template, value, id) { var deferred = q.defer(); deferred.resolve({
                    service: 'gmail', user: 'toto', password: 'tata', send: true, from: 'jbillay@gmail.com', subject: 'test'
                }); return deferred.promise; };
                var stubNodemailer = { createTransport: function (obj) { return { sendMail: function (obj, callback) { return callback(null, {messageId: 12345}); } }; } };
                var Mail = proxyquire('../../server/objects/mail', {'./option': stubOption, 'nodemailer': stubNodemailer});
                var mail = new Mail();
                mail.init()
                    .then(function () {
                        mail.send()
                            .then(function (res) {
                                assert.equal(res, 'Message sent: 12345');
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
            it('Should send email which fail to send the mail', function (done) {
                var stubOption = function option() {};
                stubOption.prototype.get = function (template, value, id) { var deferred = q.defer(); deferred.resolve({
                    service: 'gmail', user: 'toto', password: 'tata', send: true, from: 'jbillay@gmail.com', subject: 'test'
                }); return deferred.promise; };
                var stubNodemailer = { createTransport: function (obj) { return { sendMail: function (obj, callback) { return callback('Mock to fail', null); } }; } };
                var Mail = proxyquire('../../server/objects/mail', {'./option': stubOption, 'nodemailer': stubNodemailer});
                var mail = new Mail();
                mail.init()
                    .then(function () {
                        mail.send()
                            .then(function (res) {
                                return done('Should not send the mail !');
                            })
                            .catch(function (err) {
                                assert.equal(err, 'Error: Impossible to send mail : Mock to fail');
                                return done();
                            });
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
        });
        describe('Test sendEmail', function () {
            it('Should send email which fail to init mail', function (done) {
                var stubOption = function option() {};
                stubOption.prototype.get = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubNodemailer = { createTransport: function (obj) { return { sendMail: function (obj, callback) { return callback('Mock to fail', null); } }; } };
                var Mail = proxyquire('../../server/objects/mail', {'./option': stubOption, 'nodemailer': stubNodemailer});
                var mail = new Mail();
                mail.sendEmail()
                    .then(function (res) {
                        return done('Should not send email !');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Not able to init mail function : Error: Mock to fail');
                        return done();
                    });
            });
            it('Should send email which fail to generate mail content', function (done) {
                var stubOption = function option() {};
                stubOption.prototype.get = function (name) { var deferred = q.defer();
                    if (name === 'mailConfig') { deferred.resolve({ service: 'gmail', user: 'toto', password: 'tata', send: true, from: 'jbillay@gmail.com', subject: 'test' }); }
                    else if (name === 'emailTemplate') { deferred.reject('Mock to fail'); }
                    return deferred.promise; };
                var stubNodemailer = { createTransport: function (obj) { return { sendMail: function (obj, callback) { return callback('Mock to fail', null); } }; } };
                var Mail = proxyquire('../../server/objects/mail', {'./option': stubOption, 'nodemailer': stubNodemailer});
                var mail = new Mail();
                mail.sendEmail('toto', {id: 1}, 'jbillay@gmail.com')
                    .then(function (res) {
                        return done('Should not send email !');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Not able to get generate content : Error: Not able to get template : Mock to fail');
                        return done();
                    });
            });
            it('Should send email which fail to send mail', function (done) {
                var stubOption = function option() {};
                stubOption.prototype.get = function (name) { var deferred = q.defer();
                    if (name === 'mailConfig') { deferred.resolve({ service: 'gmail', user: 'toto', password: 'tata', send: true, from: 'jbillay@gmail.com', subject: 'test' }); }
                    else if (name === 'emailTemplate') { deferred.resolve([{ id: 0, name: 'toto', key: null, html: 'TEST Out of stock {{id}} {{timekey}} HTML', text: 'TEST Out of Stock TEXT', title: 'Email pour user {{id}}' } ]); }
                    return deferred.promise; };
                var stubNodemailer = { createTransport: function (obj) { return { sendMail: function (obj, callback) { return callback('Mock to fail', null); } }; } };
                var Mail = proxyquire('../../server/objects/mail', {'./option': stubOption, 'nodemailer': stubNodemailer});
                var mail = new Mail();
                mail.sendEmail('toto', {id: 1}, 'jbillay@gmail.com')
                    .then(function (res) {
                        return done('Should not send email !');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Impossible to send mail : Error: Impossible to send mail : Mock to fail');
                        return done();
                    });
            });
        });
    });
});