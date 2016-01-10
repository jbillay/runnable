/**
 * Created by jeremy on 17/12/2015.
 */

var Partner = require('../objects/partner');

exports.create = function (req, res, next) {
    'use strict';
    console.log('Create new partner');
    var partner = new Partner(),
        newPartner = req.body.partner;
    partner.create(newPartner.name, newPartner.fee, newPartner.expiry, newPartner.user, function (err, partner) {
        if (err) {
            console.log(new Error('Not able to create new partner : ' + err));
            return res.jsonp({msg: err, type: 'error'});
        }
        req.partner = partner;
        res.jsonp({msg: partner, type: 'success'});
        next();
    });
};

exports.getList = function (req, res) {
    'use strict';
    console.log('Get partner list');
    var partner = new Partner(),
        old = 0;
    partner.getList(old, function (err, partners) {
        if (err) {
            console.log(new Error('Not able to get partners : ' + err));
            return res.jsonp({msg: err, type: 'error'});
        } else {
            return res.jsonp({msg: partners, type: 'success'});
        }
    });
};

exports.getByToken = function (req, res) {
    'use strict';
    var partner = new Partner(),
        token = req.params.token;
    console.log('Get partner by token : ' + token);
    partner.getByToken(token)
        .then(function (selectedPartner) {
            return res.jsonp({msg: selectedPartner, type: 'success'});
        })
        .catch(function (err) {
            console.log(new Error('Not able to get partners by token : ' + err));
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.sendInfo = function (req, res) {
    'use strict';
    var partner = new Partner(),
        partnerId = req.body.partner.id || req.partner.id;
    console.log('Send info on partnership to partner : ' + partnerId);
    partner.sendInfo(partnerId)
        .then(function (msg) {
            return res.jsonp({msg: msg, type: 'success'});
        })
        .catch(function (err) {
            console.log(new Error('Not able to send info to partners : ' + err));
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.notifyJourneyCreation = function (req, res) {
    'use strict';
    console.log('Notify partner for run : ' + req.Run.id);
    var partner = new Partner(),
        run = req.Run,
        journey = req.Journey;
    partner.notifyJourneyCreation(run, journey)
        .then(function (msg) {
            console.log({msg: msg, type: 'success'});
        })
        .catch(function (err) {
            console.log(new Error('Not able to notify journey creation: ' + err));
        });
};