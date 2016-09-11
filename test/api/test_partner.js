/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Partner = require('../../server/objects/partner');
var settings = require('../../conf/config');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of partner object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of partner over !');
    });

    describe('Test with local database', function () {
        it('Create a new partnership', function (done) {
            var partner = new Partner(),
                partnership = {
                    id: 4,
                    name: 'St-Yorre',
                    token: 'ABCD14526JUEIRO',
                    expiry: '2016-01-28',
                    fee: 8.2,
                    UserId : 1,
                    createdAt: '2015-01-28 11:29:13',
                    updatedAt: '2015-01-28 11:29:13'
                };
            partner.set({});
            partner.set(partnership);
            var tmp = partner.get();
            assert.equal(tmp.id, 4);
            assert.equal(tmp.name, 'St-Yorre');
            assert.equal(tmp.token, 'ABCD14526JUEIRO');
            assert.equal(tmp.fee, 8.2);
            partner.create(partnership.name, partnership.fee, partnership.expiry, partnership.UserId,
                function (err, newPartner) {
                    if (err) return done(err);
                    assert.equal(newPartner.name, 'St-Yorre');
                    assert.equal(newPartner.fee, 8.2);
                    assert.equal(newPartner.UserId, 1);
                    assert.isNotNull(newPartner.token);
                    partner.getByToken(newPartner.token)
                        .then(function (selectedPartner) {
                            assert.equal(selectedPartner.name, 'St-Yorre');
                            assert.equal(selectedPartner.fee, 8.2);
                            assert.equal(selectedPartner.User.email, 'jbillay@gmail.com');
                            return done();
                        })
                        .catch(function (err) {
                            return done(err);
                        });
                });
        });

        describe('Get partnership', function () {
            var partner = new Partner();
            it('Get an existing partner', function (done) {
                partner.getByToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNDgsImV4cCI6MTIwNTA5NjA2NjF9.-vmI9gHnCFX30N2oVhQLiADX-Uz2XHzrHjWjJpvSERo')
                    .then(function (partner) {
                        assert.equal(partner.name, 'TCC');
                        assert.equal(partner.fee, 6.8);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
            it('Get an null partner', function (done) {
                partner.getByToken(null)
                    .then(function (partner) {
                        assert.isNull(partner);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
        });

        describe('Get all partners', function () {
            var partner = new Partner();

            it('Get all active partners', function (done) {
                partner.getList(0, function (err, partners) {
                    if (err) return done(err);
                    assert.equal(partners.length, 2);
                    return done();
                });
            });

            it('Get all partners including inactive', function (done) {
                partner.getList(1, function (err, partners) {
                    if (err) return done(err);
                    assert.equal(partners.length, 3);
                    return done();
                });
            });
        });

        describe('Send info to partner', function () {
            var partner = new Partner();

            it('Send info to partner 1', function (done) {
                partner.sendInfo(1)
                    .then(function (msg) {
                        assert.equal(msg, 'Partner info sent');
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
        });

        it('Notify partner of a journey creation', function (done) {
            var partner = new Partner(),
                run = {
                    id: 5,
                    name: 'Test'
                },
                journey = {
                    journeyId: 3,
                    journeyStart: 'Luzarches',
                    PartnerId: 1
                };
            partner.notifyJourneyCreation(run, journey)
                .then(function (msg) {
                    assert.equal(msg, 'Partner notification sent');
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
    });
    describe('Test with mock', function () {
        describe('Test create', function () {
            it('Should attach run to a fee which fail to set run', function (done) {
                var stubModel = { Partner: { create: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Partner = proxyquire('../../server/objects/partner', {'../models': stubModel});
                var partner = new Partner();
                partner.create('toto', 18, '2017-05-09', 1, function (err, partner) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not create partner !');
                    }
                });
            });
        });
        describe('Test getByToken', function () {
            it('Should attach run to a fee which fail to set run', function (done) {
                var stubModel = { Partner: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Partner = proxyquire('../../server/objects/partner', {'../models': stubModel});
                var partner = new Partner();
                partner.getByToken('toto')
                    .then(function () {
                        return done('Should not create partner !');
                    })
                    .catch(function (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test getList', function () {
            it('Should attach run to a fee which fail to set run', function (done) {
                var stubModel = { Partner: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Partner = proxyquire('../../server/objects/partner', {'../models': stubModel});
                var partner = new Partner();
                partner.getList(1, function (err, partner) {
                    if (err) {
                        assert.include(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not create partner !');
                    }
                });
            });
        });
        describe('Test sendInfo', function () {
            it('Should send information to the partner which fail to add message in inbox', function (done) {
                var stubModel = { Partner: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2, name: 'tito', expiry: '2017-03-09', fee: 0, token: 'ksdfjlsjdlkfjlsjdfljsl', User: {id: 1}}); return deferred.promise; } } };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Partner = proxyquire('../../server/objects/partner', {'../models': stubModel, './inbox': stubInbox});
                var partner = new Partner();
                partner.sendInfo(2)
                    .then(function () {
                        return done('Should not create partner !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Partner send info err : Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test notifyJourneyCreation', function () {
            it('Should notify partner for a journey creation which fail to find run', function (done) {
                var stubModel = { Partner: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2, name: 'tito', expiry: '2017-03-09', fee: 0, token: 'ksdfjlsjdlkfjlsjdfljsl', User: {id: 1}}); return deferred.promise; } },
                                    Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Partner = proxyquire('../../server/objects/partner', {'../models': stubModel, './inbox': stubInbox});
                var partner = new Partner();
                partner.notifyJourneyCreation({id: 1, name: 'lsdkfj', address_start: 'Luzarches'}, {id: 2, PartnerId: 3})
                    .then(function () {
                        return done('Should not create partner !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should notify partner for a journey creation which fail to add message in inbox', function (done) {
                var stubModel = { Partner: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2, name: 'tito', expiry: '2017-03-09', fee: 0, token: 'ksdfjlsjdlkfjlsjdfljsl', User: {id: 1}}); return deferred.promise; } },
                                    Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2, name: 'maxicross'}); return deferred.promise; } } };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Partner = proxyquire('../../server/objects/partner', {'../models': stubModel, './inbox': stubInbox});
                var partner = new Partner();
                partner.notifyJourneyCreation({id: 1, name: 'lsdkfj', address_start: 'Luzarches'}, {id: 2, PartnerId: 3})
                    .then(function () {
                        return done('Should not create partner !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Partner send info err : Mock to fail');
                        return done();
                    });
            });
        });
    });
});