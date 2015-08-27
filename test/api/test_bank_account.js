/**
 * Created by jeremy on 31/01/15.
 */

'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var BankAccount = require('../../server/objects/bank_account');
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


describe('Test of bank_account object', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        this.timeout(settings.timeout);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
                    function(callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/bankAccount.json');
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
    after(function () {
        console.log('Test of bank account over !');
    });
	
	
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
		assert.equal(tmp.owner, 'Jeremy Billay');
		assert.equal(tmp.agency_name, 'CIC');
		assert.equal(tmp.IBAN, 'FR7618206000576025840255308');
		assert.equal(tmp.BIC, 'AGRIFRPP882');
		assert.equal(tmp.user_id, 1);
        bank.save(function (err, bankAccount) {
            if (err) {
				console.log(err);
				return done(err);
			}
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
			owner: 'Richard Couret',
            agency_name: 'Crédit Agricole',
            IBAN: 'FR7618206000576025840200000',
            BIC: 'AGRIFRPP000'
		},
		user = {
			id: 2
		};
        var bank = new BankAccount();
		bank.set(account, user);
		var tmp = bank.get();
		assert.equal(tmp.owner, 'Richard Couret');
		assert.equal(tmp.agency_name, 'Crédit Agricole');
		assert.equal(tmp.IBAN, 'FR7618206000576025840200000');
		assert.equal(tmp.BIC, 'AGRIFRPP000');
		assert.equal(tmp.user_id, 2);
        bank.save(function (err, bankAccount) {
            if (err) {
				console.log(err);
				return done(err);
			}
			assert.isNull(err);
			assert.equal(bankAccount.owner, 'Richard Couret');
			assert.equal(bankAccount.agency_name, 'Crédit Agricole');
			assert.equal(bankAccount.IBAN, 'FR7618206000576025840200000');
			assert.equal(bankAccount.BIC, 'AGRIFRPP000');
            bank.getUserAccount(user.id, function (err, bankAccount) {
				if (err) return done(err);
				assert.isNull(err);
				assert.equal(bankAccount.owner, 'Richard Couret');
				assert.equal(bankAccount.agency_name, 'Crédit Agricole');
				assert.equal(bankAccount.IBAN, 'FR7618206000576025840200000');
				assert.equal(bankAccount.BIC, 'AGRIFRPP000');
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
            if (err) {
				console.log(err);
				return done(err);
			}
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