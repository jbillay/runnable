/**
 * Created by jeremy on 21/02/15.
 */

'use strict';

var request = require('supertest'),
    models = require('../../server/models/index'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    settings = require('../../conf/config'),
    superagent = require('superagent');

function loginUser(agent) {
    return function(done) {
        function onResponse(err, res) {
            return done();
        }
        agent
            .post('http://localhost:' + settings.port + '/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);
    };
}

describe('Test of Validation Journey API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API Validation Journey over !');
    });
	
	describe('POST /api/validation', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should add validation for joinId 4', function(done) {
            var validation = {
				joinId: 4,
                comment_driver: 'Revoir la musique !',
                comment_service: 'Service au top comme à chaque fois',
                rate_driver: 4,
                rate_service: 5
			};
			agent
                .post('http://localhost:' + settings.port + '/api/validation')
				.send(validation)
                .end(function (err, res) {
					assert.equal(res.body.msg, 'journeyValidationDone');
					return done();
				});
        });
		
        it('should add validation for an not existing joinId', function(done) {
            var validation = {
				joinId: 44564,
                comment_driver: 'Revoir la musique !',
                comment_service: 'Service au top comme à chaque fois',
                rate_driver: 4,
                rate_service: 5
			};
			agent
                .post('http://localhost:' + settings.port + '/api/validation')
				.send(validation)
                .end(function (err, res) {
					assert.equal(res.body.msg, 'journeyNotValidated');
					return done();
				});
        });
	});
});
