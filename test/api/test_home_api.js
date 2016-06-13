/**
 * Created by jeremy on 07/02/15.
 */
'use strict';

var request = require('supertest'),
    models = require('../../server/models/index'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    settings = require('../../conf/config');

describe('Test of home API', function () {

    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API home over !');
    });

    describe('GET /api/home/feedback', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/home/feedback')
                .expect(200, done);
        });
        it('should return public info on user 1', function (done) {
            request(app)
                .get('/api/home/feedback')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 3);
                    assert.equal(res.body[0].rate_service, 3);
                    assert.equal(res.body[0].rate_driver, 4);
                    assert.equal(res.body[0].comment_service, 'Un grand merci à l\'équipe Myruntrip pour la fin');
                    done();
                });
        });
    });
});
