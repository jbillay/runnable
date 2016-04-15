/**
 * Created by jeremy on 12/04/2016.
 */

var Fee = require('../objects/fee');
var _ = require('lodash');

exports.getFee = function (req, res) {
    'use strict';
    var fee = new Fee(),
        runId = _.toNumber(req.params.runId);
    fee.getForUser(req.user.id, runId)
        .then(function (fee) {
            return res.jsonp({msg: fee, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.getList = function (req, res) {
    'use strict';
    var fee = new Fee();
    fee.getList()
        .then(function (fees) {
            return res.jsonp({msg: fees, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.add = function (req, res) {
    'use strict';
    var fee = new Fee(),
        newFee = req.body.fee;

    // New fees will always be false has default fees will be only updated
    fee.add(newFee.percentage, newFee.value, newFee.discount, false,
            newFee.start_date, newFee.end_date, newFee.userId, newFee.runId)
        .then(function (fee) {
            return res.jsonp({msg: fee, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.update = function (req, res) {
    'use strict';
    var fee = new Fee(),
        updateFee = req.body.fee;

    fee.update(updateFee.id, updateFee.percentage, updateFee.value, updateFee.discount, updateFee.default,
            updateFee.start_date, updateFee.end_date, updateFee.userId, updateFee.runId)
        .then(function (fee) {
            return res.jsonp({msg: fee, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.delete = function (req, res) {
    'use strict';
    var fee = new Fee(),
        id = _.toNumber(req.params.id);

    fee.remove(id)
        .then(function (fee) {
            return res.jsonp({msg: fee, type: 'success'});
        })
        .catch(function (err) {
            console.log(err);
            return res.jsonp({msg: err, type: 'error'});
        });
};