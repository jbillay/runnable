/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Partner = require('../../server/objects/partner');
var async = require('async');
var settings = require('../../conf/config');
var q = require('q');

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

describe('Test of partner object', function () {
    beforeEach(function (done) {
        this.timeout(settings.timeout);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
                    function (callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/partner.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
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
        console.log('Test of partner over !');
    });

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
});