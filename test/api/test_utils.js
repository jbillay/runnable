/**
 * Created by jeremy on 31/01/15.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Utils = require('../../server/objects/utils');

describe('Test of utils object', function () {
    describe('Geocode util tests', function () {
        it('Should get location for Paris', function (done) {
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
        it('Should failed as address is not findable', function (done) {
            var util = new Utils();

            util.geocode('UIHSD7D378HD327')
                .catch(function (err) {
                    assert.include(err, 'ZERO_RESULTS');
                    return done();
                });
        });
    });
});