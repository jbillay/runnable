'use strict';

var q = require('q');
var _ = require('lodash');
var request = require('request');
var qs = require('qs');
var settings = require('../../conf/config');

function util() {

}

util.prototype.geocode = function (address) {
    var deferred = q.defer();

    if (address && address.length > 0) {
        var options = {address: address, key: settings.google.api_key};
        var uri = 'https://maps.googleapis.com/maps/api/geocode/json';
        request({
            uri: uri,
            qs: options,
            method: 'GET'
        }, function(err, resp, body) {
            if (err) {
                deferred.reject(err);
            }
            var result;
            try {
                result = JSON.parse(body);
                if (result.status === 'OK') {
                    deferred.resolve(result.results[0].geometry.location);
                } else {
                    var msg = result.status;
                    if (result.error_message) {
                        msg += ': ' + result.error_message;
                    }
                    console.error(msg);
                    deferred.reject(msg);
                }
            } catch (err) {
                deferred.reject(err);
            }
        });
    } else {
        deferred.reject('Address need to be defined');
    }
    return deferred.promise;
};

module.exports = util;