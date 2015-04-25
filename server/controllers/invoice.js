/**
 * Created by jeremy on 21/02/15.
 */

var ipn = require('paypal-ipn');
var Invoice = require('../objects/invoice');

exports.getByUser = function (req, res) {
    'use strict';
    var invoice = new Invoice();
    invoice.getByUser(req.user.id, function (err, invoiceList) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(invoiceList);
        }
    });
};

exports.getByDriver = function (req, res) {
    'use strict';
    var invoice = new Invoice();
    invoice.getByDriver(req.user.id, function (err, invoiceList) {
        if (err) {
            res.jsonp({msg: err, type: 'error'});
        } else {
            res.jsonp(invoiceList);
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
    ipn.verify(req.body, {'allow_sandbox': true}, function callback(err, msg) {
        if (err) {
            console.log('IPN Error : ' + err);
        } else {
            var amount = parseFloat(req.body.mc_gross),
                status = req.body.payment_status.toLowerCase(),
                invoice = new Invoice();
            invoice.updatePaymentStatus(req.body.invoice, amount, status, req.body.txn_id,
                function (err, res) {
                    if (err) {
                        console.log('IPN Error: ' + err);
                    }
                    console.log('IPN VERIFIED');
                });
        }
    });
};
