/**
 * Created by jeremy on 31/01/15.
 */

'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var BankAccount = require('../../server/objects/bank_account');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of bank_account object', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of bank account over !');
    });
	

    describe('Test with local database', function () {
        it('Get bank account for the user 1', function (done) {
            var bank = new BankAccount();
            bank.getUserAccount(1, function (err, bankAccount) {
                if (err) return done(err);
                assert.equal(bankAccount.owner, 'Jeremy Billay');
                assert.equal(bankAccount.agency_name, 'Crédit Agricole');
                assert.equal(bankAccount.IBAN, 'FR7618206000576025840255308');
                assert.equal(bankAccount.BIC, 'AGRIFRPP882');
                done();
            });
        });

        it('Get bank account for a user 2 who dont have one', function (done) {
            var bank = new BankAccount();
            bank.getUserAccount(10, function (err, bankAccount) {
                if (err) return done(err);
                assert.isNull(bankAccount);
                return done();
            });
        });

        it('Update a bank account for the user 1', function (done) {
            var account = {
                    id: 1,
                    owner: 'Jeremy Billay',
                    agency_name: 'CIC',
                    IBAN: 'FR7618206000576025840255308',
                    BIC: 'AGRIFRPP882'
                },
                user = {
                    id: 1
                };
            var bank = new BankAccount();
            bank.set(account, user);
            var tmp = bank.get();
            assert.equal(tmp.id, 1);
            assert.equal(tmp.owner, 'Jeremy Billay');
            assert.equal(tmp.agency_name, 'CIC');
            assert.equal(tmp.IBAN, 'FR7618206000576025840255308');
            assert.equal(tmp.BIC, 'AGRIFRPP882');
            assert.equal(tmp.user_id, 1);
            bank.save(function (err, bankAccount) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(bankAccount.owner, 'Jeremy Billay');
                assert.equal(bankAccount.agency_name, 'CIC');
                assert.equal(bankAccount.IBAN, 'FR7618206000576025840255308');
                assert.equal(bankAccount.BIC, 'AGRIFRPP882');
                bank.getUserAccount(user.id, function (err, bankAccount) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(bankAccount.owner, 'Jeremy Billay');
                    assert.equal(bankAccount.agency_name, 'CIC');
                    assert.equal(bankAccount.IBAN, 'FR7618206000576025840255308');
                    assert.equal(bankAccount.BIC, 'AGRIFRPP882');
                    return done();
                });
            });
        });

        it('Create a bank account for the user 2', function (done) {
            var account = {
                    owner: 'Emilie Francisco',
                    agency_name: 'Crédit Agricole IDF',
                    IBAN: 'FR761820600666025840200000',
                    BIC: 'AGRIFRPP986'
                },
                user = {
                    id: 3
                };
            var bank = new BankAccount();
            bank.set(account, user);
            var tmp = bank.get();
            assert.equal(tmp.owner, 'Emilie Francisco');
            assert.equal(tmp.agency_name, 'Crédit Agricole IDF');
            assert.equal(tmp.IBAN, 'FR761820600666025840200000');
            assert.equal(tmp.BIC, 'AGRIFRPP986');
            assert.equal(tmp.user_id, 3);
            bank.save(function (err, bankAccount) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(bankAccount.owner, 'Emilie Francisco');
                assert.equal(bankAccount.agency_name, 'Crédit Agricole IDF');
                assert.equal(bankAccount.IBAN, 'FR761820600666025840200000');
                assert.equal(bankAccount.BIC, 'AGRIFRPP986');
                bank.getUserAccount(user.id, function (err, bankAccount) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(bankAccount.owner, 'Emilie Francisco');
                    assert.equal(bankAccount.agency_name, 'Crédit Agricole IDF');
                    assert.equal(bankAccount.IBAN, 'FR761820600666025840200000');
                    assert.equal(bankAccount.BIC, 'AGRIFRPP986');
                    return done();
                });
            });
        });

        it('Update the bank account for the user 2', function (done) {
            var account = {
                    owner: 'Richard Couret',
                    agency_name: 'CIC',
                    IBAN: 'FR7618206000576025840200000',
                    BIC: 'AGRIFRPP000',
                },
                user = {
                    id: 2
                };
            var bank = new BankAccount();
            bank.set(account, user);
            var tmp = bank.get();
            assert.equal(tmp.owner, 'Richard Couret');
            assert.equal(tmp.agency_name, 'CIC');
            assert.equal(tmp.IBAN, 'FR7618206000576025840200000');
            assert.equal(tmp.BIC, 'AGRIFRPP000');
            assert.equal(tmp.user_id, 2);
            bank.save(function (err, bankAccount) {
                if (err) return done(err);
                assert.isNull(err);
                assert.equal(bankAccount.owner, 'Richard Couret');
                assert.equal(bankAccount.agency_name, 'CIC');
                assert.equal(bankAccount.IBAN, 'FR7618206000576025840200000');
                assert.equal(bankAccount.BIC, 'AGRIFRPP000');
                bank.getUserAccount(user.id, function (err, bankAccount) {
                    if (err) return done(err);
                    assert.isNull(err);
                    assert.equal(bankAccount.owner, 'Richard Couret');
                    assert.equal(bankAccount.agency_name, 'CIC');
                    assert.equal(bankAccount.IBAN, 'FR7618206000576025840200000');
                    assert.equal(bankAccount.BIC, 'AGRIFRPP000');
                    return done();
                });
            });
        });
    });

    describe('Test with mocks', function () {
        it('Should get a user bank account which fail', function (done) {
                    var stub = { BankAccount: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
            var BankAccount = proxyquire('../../server/objects/bank_account',
                {'../models': stub});
            var bank = new BankAccount();
            bank.getUserAccount(1, function (err, bankAccount) {
                assert.equal(err, 'Mock to fail');
                return done();
            });
        });
        it('Should save a user bank account which fail retrieve user', function (done) {
            var account = {
                    owner: 'Richard Couret',
                    agency_name: 'CIC',
                    IBAN: 'FR7618206000576025840200000',
                    BIC: 'AGRIFRPP000'
                },
                user = {
                    id: 2
                };
            var stub = { User: {
                find: function (options) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
            } };
            var BankAccount = proxyquire('../../server/objects/bank_account',
                {'../models': stub});
            var bank = new BankAccount();
            bank.set({}, {});
            bank.set(account, user);
            bank.save(function (err, bankAccount) {
                assert.equal(err, 'Mock to fail');
                assert.isNull(bankAccount);
                return done();
            });
        });
        it('Should save a user bank account which fail on find or create', function (done) {
            var account = {
                    owner: 'Richard Couret',
                    agency_name: 'CIC',
                    IBAN: 'FR7618206000576025840200000',
                    BIC: 'AGRIFRPP000'
                },
                user = {
                    id: 2
                };
            var stub = { BankAccount: {
                    find: function (options) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                    findOrCreate: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
            } };
            var BankAccount = proxyquire('../../server/objects/bank_account',
                {'../models': stub});
            var bank = new BankAccount();
            bank.set(account, user);
            bank.save(function (err, bankAccount) {
                assert.equal(err, 'Mock to fail');
                return done();
            });
        });
    });
});