/**
 * Created by jeremy on 11/04/2016.
 */
/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Fee = require('../../server/objects/fee');
var settings = require('../../conf/config');
var sinon = require('sinon');
var q = require('q');
var fs = require('fs');
var path = require('path');

describe('Test of fee object', function () {
    before(function (done) {
        this.timeout(settings.timeout);
        var fakeTime = new Date(2016, 6, 6, 0, 0, 0, 0).getTime();
        sinon.clock = sinon.useFakeTimers(fakeTime, 'Date');
        models.loadFixture(done);
    });

    afterEach(function() {
        // runs after each test in this block
        sinon.clock.restore();
    });

    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of fee over !');
    });

    it('Should get default fees value', function(done) {
        var fee = new Fee();
        fee.getDefault()
            .then(function (res) {
                assert.equal(res.percentage, 0.12);
                assert.equal(res.value, 1);
                assert.isNull(res.discount);
                assert.isTrue(res.default);
                assert.isNull(res.end_date);
                assert.isNull(res.RunId);
                assert.isNull(res.UserId);
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Should get fees value for a user on a run', function(done) {
        var fee = new Fee();
        fee.getForUser(1, 2)
            .then(function (res) {
                assert.equal(res.percentage, 0.10);
                assert.equal(res.value, 2);
                assert.equal(res.discount, 0.20);
                fee.getForUser(2, 2)
                    .then(function (res) {
                        assert.equal(res.percentage, 0.10);
                        assert.equal(res.value, 2);
                        assert.isNull(res.discount);
                        fee.getForUser(3, 10)
                            .then(function (res) {
                                assert.equal(res.percentage, 0.12);
                                assert.equal(res.value, 1);
                                assert.isNull(res.discount);
                                return done();
                            })
                            .catch(function (err) {
                                return done(err);
                            });
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Should get list of all fees values', function(done) {
        var fee = new Fee();
        fee.getList()
            .then(function (res) {
                assert.equal(res.length, 5);
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Should add a fee to the list of all fees values', function(done) {
        var fee = new Fee();
        fee.add(0.15, 2, 0.5, false, null, null, 1, 5)
            .then(function (res) {
                fee.getList()
                    .then(function (res) {
                        assert.equal(res.length, 6);
                        assert.equal(res[5].id, 8);
                        assert.equal(res[5].percentage, 0.15);
                        assert.equal(res[5].value, 2);
                        assert.equal(res[5].discount, 0.5);
                        assert.equal(res[5].UserId, 1);
                        assert.equal(res[5].RunId, 5);
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

    it('Should remove a fee from the list of all fees values', function(done) {
        var fee = new Fee();
        fee.remove(3)
            .then(function (res) {
                fee.getList()
                    .then(function (res) {
                        assert.equal(res.length, 5);
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

    it('Should update the default fee from the list of all fees values', function(done) {
        var fee = new Fee();
        fee.update(1, 0.2, 1, 0.1, true, null, null, null, null)
            .then(function (res) {
                fee.getDefault()
                    .then(function (res) {
                        assert.equal(res.id, 9);
                        assert.equal(res.percentage, 0.2);
                        assert.equal(res.value, 1);
                        assert.equal(res.discount, 0.1);
                        assert.isNull(res.end_date);
                        assert.isNull(res.UserId);
                        assert.isNull(res.RunId);
                        fee.getList()
                            .then(function (res) {
                                assert.equal(res.length, 5);
                                return done();
                            })
                            .catch(function (err) {
                                return done(err);
                            });
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Should update a fee from the list of all fees values', function(done) {
        var fee = new Fee();
        fee.update(5, 0.5, 3, 0.3, false, null, null, 1, 3)
            .then(function (res) {
                assert.equal(res.id, 10);
                assert.equal(res.percentage, 0.5);
                assert.equal(res.value, 3);
                assert.equal(res.discount, 0.3);
                assert.isNull(res.end_date);
                assert.equal(res.UserId, 1);
                assert.equal(res.RunId, 3);
                fee.getList()
                    .then(function (res) {
                        assert.equal(res.length, 5);
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
});

