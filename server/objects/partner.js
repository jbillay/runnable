/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

var models = require('../models');
var jwt = require('jsonwebtoken');
var q = require('q');

function partner() {
    this.id = null;
    this.name = null;
    this.token = null;
    this.expiry= null;
    this.fee = null;
    this.createdAt = null;
    this.updatedAt = null;
}

partner.prototype.get = function () {
    return this;
};

partner.prototype.set = function (partner) {
    if (partner.id) {
        this.id = partner.id;
    }
    if (partner.name) {
        this.name = partner.name;
    }
    if (partner.token) {
        this.token = partner.token;
    }
    if (partner.expiry) {
        this.expiry = partner.expiry;
    }
    if (partner.fee) {
        this.fee = partner.fee;
    }
    if (partner.createdAt) {
        this.createdAt = partner.createdAt;
    }
    if (partner.updatedAt) {
        this.updatedAt = partner.updatedAt;
    }
};

partner.prototype.create = function (name, fee, expiry, done) {
    var expirySplit = expiry.split('-'),
        expiryDate =  new Date(expirySplit[0], expirySplit[1], expirySplit[2]).getTime() - Date.now(),
        token = jwt.sign({ name: name }, 'P@rtner$hip@MyRunTrip2014$', { expiresIn: expiryDate}),
        partnership = {
            name:   name,
            token:  token,
            expiry: expiry,
            fee:    fee
        };
    models.Partner.create(partnership)
        .then(function (newPartnership) {
            done(null, newPartnership);
        })
        .catch(function (err) {
            done(err, null);
        });
};

partner.prototype.getByToken = function (token) {
    var deferred = q.defer();

    models.Partner.find({where: {token: token}})
        .then(function (partnership) {
            deferred.resolve(partnership);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

partner.prototype.filterInactive = function (partners) {
    var filteredPartner = [],
        today = new Date();
    today.setHours(0,0,0,0);
    partners.forEach(function (partner) {
        if (today <= partner.expiry) {
            filteredPartner.push(partner);
        }
    });
    return filteredPartner;
};

partner.prototype.getList = function (old, done) {
    var self = this;
    models.Partner.findAll()
        .then(function (partnership) {
            if (!old) {
                partnership = self.filterInactive(partnership);
            }
            done(null, partnership);
        })
        .catch(function (err) {
            done(err, null);
        });
};

module.exports = partner;