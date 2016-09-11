/**
 * Created by jeremy on 31/01/15.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Utils = require('../../server/objects/utils');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of utils object', function () {
    describe('Geocode util tests', function () {
        // TODO: move that test to integration testing
        it.skip('Should get location for Paris', function (done) {
            var util = new Utils();

            util.geocode('Paris, France')
                .then(function (res) {
                    assert.equal(res.lat, 48.856614);
                    assert.equal(res.lng, 2.3522219);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
        it('Should failed as address is not defined', function (done) {
            var util = new Utils();

            util.geocode('')
                .catch(function (err) {
                    assert.equal(err, 'Address need to be defined');
                    return done();
                });
        });
        // TODO: move that test to integration testing
        it.skip('Should failed as address is not findable', function (done) {
            var util = new Utils();

            util.geocode('UIHSD7D378HD327')
                .catch(function (err) {
                    assert.include(err, 'ZERO_RESULTS');
                    return done();
                });
        });
        it('Should call request to google service which fail', function (done) {
            var stubRequest = function (params, callback) { return callback('Mock to fail', null, null); };
            var Utils = proxyquire('../../server/objects/utils', {'request': stubRequest});
            var util = new Utils();
            util.geocode('Luzarches')
                .then(function () {
                    return done('Should not get information !');
                })
                .catch(function (err) {
                    assert.include(err, 'Mock to fail');
                    return done();
                });
        });
        it('Should call request to google service which fail with object return', function (done) {
            var stubRequest = function (params, callback) { return callback(null, null, 'Mock to fail'); };
            var Utils = proxyquire('../../server/objects/utils', {'request': stubRequest});
            var util = new Utils();
            util.geocode('Luzarches')
                .then(function () {
                    return done('Should not get information !');
                })
                .catch(function (err) {
                    assert.include(err.toString(), 'SyntaxError: Unexpected token M');
                    return done();
                });
        });
        it('Should call request to google service which fail as return status is KO', function (done) {
            var stubRequest = function (params, callback) { return callback(null, null, JSON.stringify({status: 'KO', error_message: 'Mock to fail'})); };
            var Utils = proxyquire('../../server/objects/utils', {'request': stubRequest});
            var util = new Utils();
            util.geocode('Luzarches')
                .then(function () {
                    return done('Should not get information !');
                })
                .catch(function (err) {
                    assert.include(err, 'KO: Mock to fail');
                    return done();
                });
        });
        it('Should call request to google service which fail as return status is KO without error message', function (done) {
            var stubRequest = function (params, callback) { return callback(null, null, JSON.stringify({status: 'KO'})); };
            var Utils = proxyquire('../../server/objects/utils', {'request': stubRequest});
            var util = new Utils();
            util.geocode('Luzarches')
                .then(function () {
                    return done('Should not get information !');
                })
                .catch(function (err) {
                    assert.include(err, 'KO');
                    return done();
                });
        });
        it('Should call request to google service with success', function (done) {
            var stubRequest = function (params, callback) { return callback(null, null, JSON.stringify({status: 'OK', results: [ {geometry: { location: { lng: 12.3, lat: 15 } } } ]})); };
            var Utils = proxyquire('../../server/objects/utils', {'request': stubRequest});
            var util = new Utils();
            util.geocode('Luzarches')
                .then(function (location) {
                    assert.deepEqual(location, { lng: 12.3, lat: 15 });
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
    });
});