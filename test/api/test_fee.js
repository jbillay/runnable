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
        // code, percentage, value, discount, remaining, isDefault, startDate, endDate, userId, runId
        fee.add(null, 0.15, 2, 0.5, null, false, null, null, 1, 5)
            .then(function (res) {
                fee.getList()
                    .then(function (res) {
                        assert.equal(res.length, 6);
                        assert.equal(res[res.length - 1].id, 10);
                        assert.equal(res[res.length - 1].percentage, 0.15);
                        assert.equal(res[res.length - 1].value, 2);
                        assert.equal(res[res.length - 1].discount, 0.5);
                        assert.equal(res[res.length - 1].UserId, 1);
                        assert.equal(res[res.length - 1].RunId, 5);
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
        // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
        fee.update(1, null, 0.2, 1, 0.1, true, null, null, null, null, null)
            .then(function (res) {
                fee.getDefault()
                    .then(function (res) {
                        assert.equal(res.id, 11);
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
        // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
        fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 3)
            .then(function (res) {
                assert.equal(res.id, 12);
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

    it('Should add a code to the list of all fees values', function(done) {
        var fee = new Fee();
        // code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
        fee.add('MYRUNTRIP-TEST', null, null, 0.15, false, 3, null, null, 1, 5)
            .then(function (res) {
                fee.getList()
                    .then(function (res) {
                        assert.equal(res.length, 6);
                        assert.equal(res[res.length - 1].id, 13);
                        assert.equal(res[res.length - 1].code, 'MYRUNTRIP-TEST');
                        assert.isNull(res[res.length - 1].percentage);
                        assert.isNull(res[res.length - 1].value);
                        assert.equal(res[res.length - 1].discount, 0.15);
                        assert.equal(res[res.length - 1].remaining, 3);
                        assert.equal(res[res.length - 1].UserId, 1);
                        assert.equal(res[res.length - 1].RunId, 5);
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

    it('Should add a code to the list of all fees values', function(done) {
        var fee = new Fee();
        // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
        fee.update(11, 'MYRUNTRIP-TEST', null, null, 0.23, false, 2, null, null, 1, 5)
            .then(function (res) {
                fee.getList()
                    .then(function (res) {
                        assert.equal(res.length, 7);
                        assert.equal(res[res.length - 1].id, 14);
                        assert.equal(res[res.length - 1].code, 'MYRUNTRIP-TEST');
                        assert.isNull(res[res.length - 1].percentage);
                        assert.isNull(res[res.length - 1].value);
                        assert.equal(res[res.length - 1].discount, 0.23);
                        assert.equal(res[res.length - 1].remaining, 2);
                        assert.equal(res[res.length - 1].UserId, 1);
                        assert.equal(res[res.length - 1].RunId, 5);
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

    describe('Test of check code', function () {

        it('Should return discount value of an existing code', function (done) {
            var fee = new Fee();

            fee.checkCode('MRT-JR-2016')
                .then(function (newFee) {
                    assert.equal(newFee.id, 8);
                    assert.equal(newFee.discount, 0.20);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Should return null for an non existing code', function (done) {
            var fee = new Fee();

            fee.checkCode('TOTO')
                .then(function (newFee) {
                    assert.isNull(newFee.id);
                    assert.isNull(newFee.discount);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Should return null for an existing code with no remaining', function (done) {
            var fee = new Fee();

            fee.checkCode('MRT-JR-2015')
                .then(function (newFee) {
                    assert.isNull(newFee.id);
                    assert.isNull(newFee.discount);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
    });

    describe('Test of use code', function () {
        it('Should create a code with only one usage', function (done) {
            var fee = new Fee();

            fee.add('MRT-TEST-1', null, null, 0.5, false, 1, null, null, null, null)
                .then(function (newFee) {
                    assert.equal(newFee.code, 'MRT-TEST-1');
                    assert.isNull(newFee.percentage);
                    assert.isNull(newFee.value);
                    assert.equal(newFee.discount, 0.5);
                    assert.equal(newFee.remaining, 1);
                    fee.getList()
                        .then(function (listFees) {
                            assert.equal(listFees.length, 8);
                            assert.equal(listFees[listFees.length - 1].code, 'MRT-TEST-1');
                            assert.isNull(listFees[listFees.length - 1].percentage);
                            assert.isNull(listFees[listFees.length - 1].value);
                            assert.equal(listFees[listFees.length - 1].discount, 0.5);
                            assert.equal(listFees[listFees.length - 1].remaining, 1);
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
        
        it('Should use the ticket created with only one usage', function (done) {
            var fee = new Fee();
            
            fee.checkCode('MRT-TEST-1')
                .then(function (getFee) {
                    fee.useCode(getFee.id)
                        .then(function (updatedFee) {
                            assert.equal(updatedFee.remaining, 0);
                            fee.getList()
                                .then(function (listFees) {
                                    assert.equal(listFees.length, 7);
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

    });
});

