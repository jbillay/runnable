
var Join = require('../objects/join');
var Invoice = require('../objects/invoice');

exports.create = function (req, res) {
    'use strict';
	console.log('Create a join for journey : %j', req.body);
	var join = new Join(),
        invoice = new Invoice();
	join.save(req.body, req.user, function (err, join) {
        if (err) {
            res.jsonp({msg: 'notJoined', type: 'error'});
        } else {
			req.body.join_id = join.id;
			invoice.save(req.body, req.user, function (err, Invoice) {
				if (err) {
					res.jsonp({msg: 'notJoined', type: 'error'});
				} else {
					console.log('User joined the journey');
					res.jsonp({msg: 'userJoined', type: 'success'});
				}
				err = null;
				Invoice = null;
			});
		}
		err = null;
		join = null;
	});
};

exports.listForJourney = function (req, res) {
    'use strict';
	console.log('Get list of join for a journey ' + req.params.id);
	var join = new Join();
	join.getByJourney(req.params.id, function (err, joins) {
		if (err) {
			console.log('Not able to get join list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(joins);
		}
		err = null;
		joins = null;
	});
	join = null;
};

exports.detail = function (req, res) {
    'use strict';
	console.log('Get info on join ' + req.params.id);
	var id = req.params.id;
	var join = new Join();
	join.getById(id, function (err, joinDetail) {
		if (err) {
			console.log('Not able to get info on the journey : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(joinDetail);
		}
		err = null;
		joinDetail = null;
	});
	id = null;
	join = null;
};

exports.list = function (req, res) {
	'use strict';
	console.log('Get list of joins');
	var join = new Join();
	join.getList(function (err, joins) {
		if (err) {
			console.log('Not able to get join list : ' + err);
			res.jsonp({msg: err, type: 'error'});
		} else {
			res.jsonp(joins);
		}
		err = null;
		joins = null;
	});
	join = null;
};

exports.cancel = function (req, res) {
    'use strict';
	console.log('Cancel join ' + req.params.id);
	var id = req.params.id;
	var join = new Join();
	join.cancelById(id)
		.then(function (invoice) {
			console.log('Join cancelled');
			res.jsonp({msg: 'joinCancelled', type: 'success'});
			invoice = null;
		})
		.catch(function (err) {
			console.log('Join not cancelled ' + err);
			res.jsonp({msg: 'joinNotCancelled', type: 'error'});
			err = null;
		});
	id = null;
	join = null;
};