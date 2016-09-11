/**
 * Created by jeremy on 12/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var ValidationJourney = require('../../server/controllers/validation_journey');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of ValidationJourney controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of ValidationJourney controller is over !');
    });

    describe('Test validate', function () {
        it('Should validate a journey with success', function (done) {
            var stub = function validationJourney() {};
            stub.prototype.set = function (obj) { return obj; };
            stub.prototype.create = function (callback) { return callback(null, {id: 1}); };
            var ValidationJourney = proxyquire('../../server/controllers/validation_journey',
                {'../objects/validation_journey': stub});
            var req = { body: { joinId: 1, commentDriver: 'toto',  commentService: 'ksjdljqs', rate_driver: 4, rate_service: 5 },
                        user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            ValidationJourney.validate(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'journeyValidationDone', type: 'success'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
        it('Should validate a journey which failed', function (done) {
            var stub = function validationJourney() {};
            stub.prototype.set = function (obj) { return obj; };
            stub.prototype.create = function (callback) { return callback('Mock to fail', null); };
            var ValidationJourney = proxyquire('../../server/controllers/validation_journey',
                {'../objects/validation_journey': stub});
            var req = { body: { joinId: 1, commentDriver: 'toto',  commentService: 'ksjdljqs', rate_driver: 4, rate_service: 5 },
                    user: { id: 1 } },
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            ValidationJourney.validate(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'journeyNotValidated', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
});