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
var proxyquire = require('proxyquire');

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

    describe('Test with local database', function () {
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

        describe('Should get fees value for a user on a journey', function() {
            beforeEach(function (done) {
                models.loadFixture(done);
            });
            it('Should get fees for user 1 on Run 2', function(done) {
                // Default fees : percentage : 0.12 / value : 1
                var fee = new Fee();
                fee.getForUser(1, 2)
                    .then(function (res) {
                        assert.equal(res.percentage, 0.10);
                        assert.equal(res.value, 2);
                        assert.equal(res.discount, 0.2);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });

            it('Should get fees for user 2 on run 2', function(done) {
                // Default fees : percentage : 0.12 / value : 1
                var fee = new Fee();
                fee.getForUser(2, 2)
                    .then(function (res) {
                        assert.equal(res.percentage, 0.10);
                        assert.equal(res.value, 2);
                        assert.isNull(res.discount);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });

            it('Should get fees for user 3 on run 4', function(done) {
                // Default fees : percentage : 0.12 / value : 1
                var fee = new Fee();
                fee.getForUser(3, 1)
                    .then(function (res) {
                        assert.equal(res.percentage, 0.12);
                        assert.equal(res.value, 1);
                        assert.isNull(res.discount);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
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
            fee.add(null, 0.15, 2, 0.5, null, false, null, null, 1, null)
                .then(function (res) {
                    fee.set(res);
                    var newFee = fee.get();
                    assert.equal(newFee.id, 10);
                    assert.equal(newFee.percentage, 0.15);
                    assert.equal(newFee.value, 2);
                    assert.equal(newFee.discount, 0.5);
                    assert.equal(newFee.UserId, 1);
                    assert.isNull(newFee.RunId);
                    assert.isNull(newFee.end_date);
                    fee.getList()
                        .then(function (res) {
                            assert.equal(res.length, 6);
                            assert.equal(res[res.length - 1].id, 10);
                            assert.equal(res[res.length - 1].percentage, 0.15);
                            assert.equal(res[res.length - 1].value, 2);
                            assert.equal(res[res.length - 1].discount, 0.5);
                            assert.equal(res[res.length - 1].UserId, 1);
                            assert.isNull(res[res.length - 1].RunId, 5);
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

        it('Should add a fee to the list of all fees values with end Date', function(done) {
            var fee = new Fee();
            // code, percentage, value, discount, remaining, isDefault, startDate, endDate, userId, runId
            fee.add(null, 0.15, 2, 0.5, null, false, '2015-09-02', '2017-09-02', 1, 5)
                .then(function (res) {
                    fee.set(res);
                    var newFee = fee.get();
                    assert.equal(newFee.id, 11);
                    assert.equal(newFee.percentage, 0.15);
                    assert.equal(newFee.value, 2);
                    assert.equal(newFee.discount, 0.5);
                    assert.isNotNull(newFee.end_date);
                    assert.equal(newFee.UserId, 1);
                    assert.equal(newFee.RunId, 5);
                    fee.getList()
                        .then(function (res) {
                            assert.equal(res.length, 7);
                            assert.equal(res[res.length - 1].id, 11);
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
                            assert.equal(res.length, 6);
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
                            assert.equal(res.id, 12);
                            assert.equal(res.percentage, 0.2);
                            assert.equal(res.value, 1);
                            assert.equal(res.discount, 0.1);
                            assert.isNull(res.end_date);
                            assert.isNull(res.UserId);
                            assert.isNull(res.RunId);
                            fee.getList()
                                .then(function (res) {
                                    assert.equal(res.length, 6);
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
                    assert.equal(res.id, 13);
                    assert.equal(res.percentage, 0.5);
                    assert.equal(res.value, 3);
                    assert.equal(res.discount, 0.3);
                    assert.isNull(res.end_date);
                    assert.equal(res.UserId, 1);
                    assert.equal(res.RunId, 3);
                    fee.getList()
                        .then(function (res) {
                            assert.equal(res.length, 6);
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

        it('Should update a fee from the list of all fees values', function(done) {
            var fee = new Fee();
            // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
            fee.update(13, null, 0.5, 3, 0.3, false, null, null, null, 2, 3)
                .then(function (res) {
                    assert.equal(res.id, 14);
                    assert.equal(res.percentage, 0.5);
                    assert.equal(res.value, 3);
                    assert.equal(res.discount, 0.3);
                    assert.isNull(res.end_date);
                    assert.equal(res.UserId, 2);
                    assert.equal(res.RunId, 3);
                    fee.getList()
                        .then(function (res) {
                            assert.equal(res.length, 6);
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

        it('Should update a fee from the list of all fees values but on the same run', function(done) {
            var fee = new Fee();
            // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
            fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 2)
                .then(function (res) {
                    assert.equal(res.id, 15);
                    assert.equal(res.percentage, 0.5);
                    assert.equal(res.value, 3);
                    assert.equal(res.discount, 0.3);
                    assert.isNull(res.end_date);
                    assert.equal(res.UserId, 1);
                    assert.equal(res.RunId, 2);
                    fee.getList()
                        .then(function (res) {
                            assert.equal(res.length, 7);
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
                            assert.equal(res.length, 8);
                            assert.equal(res[res.length - 1].id, 16);
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

        it('Should update a code to the list of all fees values', function(done) {
            var fee = new Fee();
            // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
            fee.update(13, 'MYRUNTRIP-TEST', null, null, 0.23, false, 2, null, null, 1, 5)
                .then(function (res) {
                    fee.getList()
                        .then(function (res) {
                            assert.equal(res.length, 9);
                            assert.equal(res[res.length - 1].id, 17);
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
                                assert.equal(listFees.length, 6);
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
                                        assert.equal(listFees.length, 5);
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
    describe('Test with mock', function () {
        describe('Test getDefault', function () {
            it('Should get default value for fees which fail', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.getDefault()
                    .then(function (fees) {
                        return done('Should not get default fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test getForUser', function () {
            it('Should get fees for a user on a journey which fail to get default values', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.getForUser(1, 2)
                    .then(function (fees) {
                        return done('Should not get user fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should get fees for a user on a journey which fail to get journey', function (done) {
                var stub = {    Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2}); return deferred.promise; } },
                                Journey: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.getForUser(1, 2)
                    .then(function (fees) {
                        return done('Should not get user fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should get fees for a user on a journey which fail to get all fees', function (done) {
                var stub = {    Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2}); return deferred.promise; },
                                        findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } },
                                Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2}); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.getForUser(1, 2)
                    .then(function (fees) {
                        return done('Should not get user fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test getList', function () {
            it('Should get list of fees which fail', function (done) {
                var stub = { Fee: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.getList()
                    .then(function (fees) {
                        return done('Should not get default fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test remove', function () {
            it('Should remove fee which fail as fee not found', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.remove(5)
                    .then(function (fees) {
                        return done('Should not get default fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should remove fee which fail to update end date', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                                    { update: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                                    ); return deferred.promise; },
                                    create: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.remove(5)
                    .then(function (fees) {
                        return done('Should not get default fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test attachUser', function () {
            it('Should attach user to a fee which fail to find user', function (done) {
                var stub = { User: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.attachUser({}, 1)
                    .then(function (fees) {
                        return done('Should not attach the user !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should attach user to a fee which fail to set user', function (done) {
                var stub = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2}); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.attachUser({ setUser: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }, 1)
                    .then(function (fees) {
                        return done('Should not attach the user !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test attachRun', function () {
            it('Should attach run to a fee which fail to find run', function (done) {
                var stub = { Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.attachRun({}, 1)
                    .then(function (fees) {
                        return done('Should not attach the run !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should attach run to a fee which fail to set run', function (done) {
                var stub = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2}); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.attachRun({ setRun: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }, 1)
                    .then(function (fees) {
                        return done('Should not attach the run !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test add', function () {
            it('Should add a fees which fail to create', function (done) {
                var stub = { Fee: { create: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // code, percentage, value, discount, remaining, isDefault, startDate, endDate, userId, runId
                fee.add(null, 0.15, 2, 0.5, null, false, null, null, 1, null)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should add a fees for a user which fail to find user', function (done) {
                var stub = { Fee: { create: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                User: { find: function (obj) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // code, percentage, value, discount, remaining, isDefault, startDate, endDate, userId, runId
                fee.add(null, 0.15, 2, 0.5, null, false, null, null, 1, null)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should add a fees for a user and a run which fail to find run', function (done) {
                var stub = { Fee: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                    setUser: function () { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; }
                }); return deferred.promise; } },
                                User: { find: function (obj) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                Run: { find: function (obj) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // code, percentage, value, discount, remaining, isDefault, startDate, endDate, userId, runId
                fee.add(null, 0.15, 2, 0.5, null, false, null, null, 1, 5)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should add a fees for a run which fail to find run', function (done) {
                var stub = { Fee: { create: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                Run: { find: function (obj) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // code, percentage, value, discount, remaining, isDefault, startDate, endDate, userId, runId
                fee.add(null, 0.15, 2, 0.5, null, false, null, null, null, 5)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test update', function () {
            it('Should update a fees which fail to find fee', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
                fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 3)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should update a fees which fail to find empty fee', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
                fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 3)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Fee version not found');
                        return done();
                    });
            });
            it('Should update a fees which fail to update existing fee', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                    { update: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                ); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
                fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 3)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should update a fees which fail to create new fee', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                                        { update: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, UserId: 2}); return deferred.promise; } }
                                    ); return deferred.promise; },
                                    create: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
                fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 3)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should update a fees which fail to attach user different from original fee', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                                        { update: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, UserId: 2}); return deferred.promise; } }
                                    ); return deferred.promise; },
                                    create: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, UserId: 2}); return deferred.promise; } },
                            User: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
                fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 3)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should update a fees which fail to attach run different from original fee when user change also', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                                        { update: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, UserId: 2}); return deferred.promise; } }
                                    ); return deferred.promise; },
                                    create: function (params) { var deferred = q.defer(); deferred.resolve({
                                        id: 1, UserId: 2, RunId: 7,
                                        setUser: function (params) { var deferred = q.defer(); deferred.resolve({id: 9}); return deferred.promise; } }); return deferred.promise; } },
                            User: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 9}); return deferred.promise; } },
                            Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }};
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
                fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, 1, 3)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should update a fees which fail to attach run different from original fee when no user defined', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                                        { update: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, UserId: 2}); return deferred.promise; } }
                                    ); return deferred.promise; },
                                    create: function (params) { var deferred = q.defer(); deferred.resolve({
                                        id: 1, UserId: 2, RunId: 7,
                                        setUser: function (params) { var deferred = q.defer(); deferred.resolve({id: 9}); return deferred.promise; } }); return deferred.promise; } },
                            Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }};
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                // id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId
                fee.update(5, null, 0.5, 3, 0.3, false, null, null, null, null, 3)
                    .then(function (fees) {
                        return done('Should not create fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test checkCode', function () {
            it('Should check if code is link to a fees which fail', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.checkCode('TOTO')
                    .then(function (fees) {
                        return done('Should not get default fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test useCode', function () {
            it('Should use code which fail to find fee', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.useCode(3)
                    .then(function (fees) {
                        return done('Should not get default fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should use code which fail as no remaining usage', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 2, remaining: 0}); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.useCode(3)
                    .then(function (fees) {
                        assert.isNull(fees);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
            it('Should use code which fail to update fee', function (done) {
                var stub = { Fee: { find: function (params) { var deferred = q.defer(); deferred.resolve(
                        {id: 2, remaining: 5, update: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                    ); return deferred.promise; } } };
                var Fee = proxyquire('../../server/objects/fee',
                    {'../models': stub});
                var fee = new Fee();
                fee.useCode(3)
                    .then(function (fees) {
                        return done('Should not get default fees !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
    });
});

