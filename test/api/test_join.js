/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Join = require('../../server/objects/join');
var Invoice = require('../../server/objects/invoice');
var Inbox = require('../../server/objects/inbox');
var settings = require('../../conf/config');

describe('Test of join object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of join over !');
    });

    it('Get join list', function (done) {
        var join = new Join();
        join.getList(function (err, joinList) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinList.length, 5);
            return done();
        });
    });

    it('Get join list by Journey', function (done) {
        var join = new Join();
        join.getByJourney(2, function (err, joinList) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinList.length, 2);
            join.getByJourney(3, function (err, joinList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinList.length, 0);
                join.getByJourney(1, function (err, joinList) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(joinList.length, 1);
                    assert.equal(joinList[0].id, 1);
                    assert.equal(joinList[0].nb_place_outward, 2);
                    assert.equal(joinList[0].nb_place_return, 2);
                    join.getByJourney(-1, function (err, joinList) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });
    });

    it('Get join list by user', function (done) {
        var join = new Join();
        join.getByUser(1, function (err, joinList) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinList.length, 1);
            join.getByUser(2, function (err, joinList) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(joinList.length, 2);
                assert.equal(joinList[1].id, 5);
                assert.equal(joinList[1].nb_place_outward, 1);
                assert.isNull(joinList[1].nb_place_return);
                join.getByUser(-1, function (err, joinList) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });
    });

    it('Get join list by id', function (done) {
        var join = new Join();
        join.getById(4, function (err, joinInfo) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(joinInfo.id, 4);
            assert.equal(joinInfo.nb_place_outward, 1);
            assert.equal(joinInfo.nb_place_return, 1);
            join.getById(-1, function (err, joinInfo) {
                assert.isNotNull(err);
                assert.isNull(joinInfo);
                return done();
            });
        });
    });

    it('Create a new Join', function (done) {
       var join = new Join(),
           newJoin = {
                id: 6,
                nb_place_outward: 3,
                nb_place_return: 2,
                journey_id: 3
           },
           user = {
               'id': 1
           };
        join.set(newJoin);
        join.setJourney(newJoin.journey_id);
        join.setUser(user);
        var tmp = join.get();
        assert.equal(tmp.id, 6);
        assert.equal(tmp.nb_place_outward, 3);
        assert.equal(tmp.nb_place_return, 2);
        join.save(tmp, user, function (err, createdJoin) {
            assert.isNull(err);
            join.getList(function (err, joinList) {
                assert.isNull(err);
                assert.equal(joinList.length, 6);
                join.getById(6, function (err, joinInfo) {
                    assert.isNull(err);
                    assert.equal(joinInfo.id, 6);
                    assert.equal(joinInfo.nb_place_outward, 3);
                    assert.equal(joinInfo.nb_place_return, 2);
                    return done();
                });
            });
        });
    });

    it('Cancel join by id', function (done) {
        var join = new Join(),
            invoice = new Invoice(),
            inbox = new Inbox(),
            user = { id: 2 },
            driver = { id: 1 };
        join.cancelById(2, user, true)
            .then(function (joinInfo) {
                invoice.getById(2, function (err, invoiceInfo) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(invoiceInfo.status, 'cancelled');
                    inbox.getList(user, function (err, messages) {
                        if (err) return done(err);
                        assert.equal(messages.length, 3);
                        assert.equal(messages[0].message, 'Cancel participation trajet Les templiers');
                        assert.include(messages[0].title, 'Les templiers');
                        inbox.getList(driver, function (err, messages) {
                            if (err) return done(err);
                            assert.equal(messages.length, 3);
                            assert.equal(messages[0].message, 'User cancel trajet Les templiers');
                            assert.include(messages[0].title, 'Les templiers');
                            return done();
                        });
                    });
                });
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Cancel not existing join', function (done) {
        var join = new Join(),
            user = { id: 1 };
        join.cancelById(42, user, true)
            .then(function (joinInfo) {
                return done(new Error('Should be an error'));
            })
            .catch(function (err) {
                assert.isNotNull(err);
                return done();
            });
    });
});