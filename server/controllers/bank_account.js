/**
 * Created by jeremy on 03/03/15.
 */

var BankAccount = require('../objects/bank_account');

exports.save = function (req, res) {
    'use strict';
	console.log('Save the bank account');
	var bankAccount = new BankAccount();
	bankAccount.set(req.body, req.user);
	bankAccount.save(function (err, newBankAccount) {
		if (err) {
			console.log('Bank Account not saved ' + err);
			res.jsonp({msg: 'bankAccountNotSaved', type: 'error'});
		} else {
			console.log('Bank Account saved');
			res.jsonp({msg: 'bankAccountSaved', type: 'success'});
		}
		err = null;
		newBankAccount = null;
	});
	bankAccount = null;
};

exports.get = function (req, res) {
    'use strict';
	console.log('Get user bank account');
	var bankAccount = new BankAccount();
	bankAccount.getUserAccount(req.user.id, function (err, userBankAccount) {
		if (err) {
			console.log('Not able to get bank account : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(userBankAccount);
		}
		err = null;
		userBankAccount = null;
	});
	bankAccount = null;
};

exports.getByUser = function (req, res) {
    'use strict';
    var id = req.params.id,
        bankAccount = new BankAccount();
    console.log('Get user ' + id + 'bank account');
    bankAccount.getUserAccount(id, function (err, userBankAccount) {
        if (err) {
            console.log('Not able to get bank account : ' + err);
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(userBankAccount);
        }
		err = null;
		userBankAccount = null;
    });
	id = null;
	bankAccount = null;
};