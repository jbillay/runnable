
var Join = require('../objects/join');
var ipn = require('paypal-ipn');

exports.create = function (req, res) {
    "use strict";
	console.log('Create a join for journey : %j', req.body);
	var join = new Join();
	join.save(req.body, req.user, function (err, join) {
		if (err) {
			res.jsonp('{"msg": "notJoined", "type": "error"}');
		} else {
			console.log('User joined the journey');
			res.jsonp('{"msg": "userJoined", "type": "success"}');
		}
	});
};

exports.listForJourney = function (req, res) {
    "use strict";
	console.log('Get list of join for a journey ' + req.params.id);
	var join = new Join();
	join.getByJourney(req.params.id, function (err, joins) {
		if (err) {
			console.log('Not able to get join list : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			res.jsonp(joins);
		}
	});
};

exports.detail = function (req, res) {
    "use strict";
	console.log('Get info on join ' + req.params.id);
	var id = req.params.id;
	var join = new Join();
	join.getById(id, function (err, joinDetail) {
		if (err) {
			console.log('Not able to get info on the journey : ' + err);
			res.jsonp('{"msg": "ko"}');
		} else {
			console.log(joinDetail);
			res.jsonp(joinDetail);
		}
	});
};

exports.list = function (req, res) {
	"use strict";
	console.log('Get list of joins');
	var join = new Join();
	join.getList(function (err, joins) {
		if (err) {
			console.log('Not able to get join list : ' + err);
			res.jsonp('{"msg": ' + err + '}');
		} else {
			res.jsonp(joins);
		}
	});
};
/*
Exemple
{ mc_gross: '50.96', ==> AMOUNT
  invoice: 'MRT20150216H02M8', ==> INVOICE
  protection_eligibility: 'Eligible',
  address_status: 'confirmed',
  payer_id: 'TWD3EPNPY3YKQ',
  tax: '0.00',
  address_street: '1 Main St',
  payment_date: '06:25:17 Feb 16, 2015 PST',
  payment_status: 'Completed', ==> IMPORTANT STATUS PAYEMENT
  charset: 'windows-1252',
  address_zip: '95131',
  first_name: 'test',
  mc_fee: '1.83',
  address_country_code: 'US',
  address_name: 'test buyer',
  notify_version: '3.8',
  custom: '',
  payer_status: 'verified',
  business: 'jbillay-facilitator@gmail.com',
  address_country: 'United States',
  address_city: 'San Jose',
  quantity: '1',
  verify_sign: 'AARfy1T5ympFszI-LDzRxLr7PDA0Ay41NpKSmXupFLbgmHrGTiFzkPjN',
  payer_email: 'jbillay-buyer@gmail.com', ==> EMAIL CLIENT
  txn_id: '83V29469P1887825P', ==> TRANSACTION ID
  payment_type: 'instant',
  last_name: 'buyer',
  address_state: 'CA',
  receiver_email: 'jbillay-facilitator@gmail.com',
  payment_fee: '',
  receiver_id: '622WFSZHPNBH4',
  txn_type: 'web_accept',
  item_name: 'Parcours My Run Trip',
  mc_currency: 'EUR',
  item_number: '',
  residence_country: 'US',
  test_ipn: '1',
  handling_amount: '0.00',
  transaction_subject: '',
  payment_gross: '',
  shipping: '0.00',
  ipn_track_id: 'b959e24b7e596' }

*/
exports.confirm = function (req, res) {
    'use strict';
    res.send(200);
    console.log('IPN info : ' + req.body);
    ipn.verify(req.body, {'allow_sandbox': true}, function callback(err, msg) {
    	console.log('Dans verify !!!');
        if (err) {
            console.log('Err: ' + err);
        } else {
            var amount = parseFloat(req.body.mc_gross),
                status = req.body.payment_statu.toLowerCase(),
                join = new Join();
            console.log('Just before updatePaymentStatus');
            join.updatePaymentStatus(req.body.invoice, amount, status, req.body.txn_id,
                function (err, res) {
                    if (err) {
                        console.log('Err: ' + err);
                    }
                    console.log('TEST ' + res);
                });
        }
    });
};
