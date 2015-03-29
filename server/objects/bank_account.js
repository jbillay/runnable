/**
 * Created by jeremy on 03/03/15.
 */

var models = require('../models');
var _ = require('lodash');

function bankAccount() {
    'use strict';
	this.id = null;
	this.owner = null;
	this.agency_name = null;
	this.IBAN = null;
    this.BIC= null;
	this.user_id = null;
}

bankAccount.prototype.get = function () {
    'use strict';
	return this;
};

bankAccount.prototype.set = function (account, user) {
    'use strict';
	if (account.id) {
		this.id = account.id; }
	if (account.owner) {
		this.owner = account.owner; }
	if (account.agency_name) {
		this.agency_name = account.agency_name; }
	if (account.IBAN) {
		this.IBAN = account.IBAN; }
	if (account.BIC) {
		this.BIC = account.BIC; }
	if (user.id) {
		this.user_id = user.id; }
};

bankAccount.prototype.getUserAccount = function (id, done) {
	'use strict';
	console.log('Try to get bank info for user : ' + id);
	models.BankAccount.find({where: {userId: id}})
		.then(function (bankAccount) {
			done(null, bankAccount);
		})
		.catch(function (err) {
			done(err, null);
		});
};

bankAccount.prototype.save = function (done) {
	'use strict';
	var that = this;
	models.User.find({where: {id: that.user_id}})
		.then(function (user) {
			models.BankAccount.findOrCreate({where: {userId: that.user_id}, 
												defaults: {	owner: that.owner,
															agency_name: that.agency_name,
															IBAN: that.IBAN,
															BIC: that.BIC}})
				.spread(function (bankAccount, created) {
					if (created) {
						bankAccount.setUser(user)
							.then(function (newBankAccount) {
								done(null, newBankAccount);
							});
					} else {
						var updateBankAccount = _.assign(bankAccount, that);
						updateBankAccount.save()
							.then(function (bankAccount) {
								done(null, bankAccount);
							});
					}
				})
				.catch(function (err) {
					done(err, null);
				});
		})
		.catch(function (err) {
			done(err, null);
		});
};

module.exports = bankAccount;