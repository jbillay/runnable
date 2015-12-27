/**
 * Created by jeremy on 31/01/15.
 */

'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var ValidationJourney = require('../../server/objects/validation_journey');
var settings = require('../../conf/config');

describe('Test of validation_journey object', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of validation journey over !');
    });

    it('Get feedback on service', function (done) {
        var val = new ValidationJourney();
        val.getUserFeedback(function (err, feedback) {
            if (err) return done(err);
            assert.equal(feedback.length, 1);
            assert.equal(feedback[0].rate_service, 5);
            assert.equal(feedback[0].UserId, 1);
            return done();
        });
    });

    it('Validate a journey', function (done) {
        var val = new ValidationJourney(),
            validationObj = {
                joinId: 4,
                userId: 2,
                comment_driver: 'Revoir la musique !',
                comment_service: 'Service au top comme à chaque fois',
                rate_driver: 4,
                rate_service: 5
            };
        val.set(validationObj);
        var tmp = val.get();
        assert.equal(tmp.rate_driver, 4);
        assert.equal(tmp.rate_service, 5);
        val.create(function (err, validation) {
            assert.equal(validation.rate_driver, 4);
            assert.equal(validation.rate_service, 5);
            val.getUserFeedback(function (err, feedback) {
                if (err) return done(err);
                assert.equal(feedback.length, 2);
                return done();
            });
        });
    });
});