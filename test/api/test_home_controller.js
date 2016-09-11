/**
 * Created by jeremy on 10/08/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var Home = require('../../server/controllers/home');
var models = require('../../server/models/index');
var settings = require('../../conf/config');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of home controller', function () {
    // Recreate the database after each test to ensure isolation
    before(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of home controller is over !');
    });

    describe('Test userFeedback', function () {
        it('Should get user feedback with success', function (done) {
            var stub = function validationJourney() {};
            stub.prototype.getUserFeedback = function (callback) { callback(null, [{id: 1}, {id: 2}]); };
            var Home = proxyquire('../../server/controllers/home',
                {'../objects/validation_journey': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Home.userFeedback(req, res);
            assert.isTrue(spyRes.withArgs([{id: 1}, {id: 2}]).calledOnce);
            res.jsonp.restore();
            return done();
        });

        it('Should get user feedback which failed', function (done) {
            var stub = function validationJourney() {};
            stub.prototype.getUserFeedback = function (callback) { callback('Mock to fail', null); };
            var Home = proxyquire('../../server/controllers/home',
                {'../objects/validation_journey': stub});
            var req = {},
                res = { jsonp: function (ret) { return ret; } };
            var spyRes = sinon.spy(res, 'jsonp');
            Home.userFeedback(req, res);
            assert.isTrue(spyRes.withArgs({msg: 'Mock to fail', type: 'error'}).calledOnce);
            res.jsonp.restore();
            return done();
        });
    });
});
