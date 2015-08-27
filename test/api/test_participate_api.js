/**
 * Created by jeremy on 21/02/15.
 */

'use strict';

var request = require('supertest'),
    models = require('../../server/models/index'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    async = require('async'),
    q = require('q'),
    settings = require('../../conf/config'),
    superagent = require('superagent');

var loadData = function (fix) {
    var deferred = q.defer();
    models[fix.model].create(fix.data)
        .complete(function (err, result) {
            if (err) {
                console.log(err);
            }
            deferred.resolve(result);
        });
    return deferred.promise;
};

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

describe('Test of participate API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        this.timeout(6000);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
                    function (callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/runs.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/journeys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/joins.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/invoices.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/discussions.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function (callback) {
                        var fixtures = require('./fixtures/participates.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/validationJourneys.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    }
                ], function (err, result) {
                    done();
                });
            });
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API participate over !');
    });
	
    describe('GET /api/participate/user/list', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of run for the current user', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/participate/user/list')
                .end(function (err, res) {
                    assert.equal(res.body.length, 4);
                    return done();
                });
        });
    });
	
	describe('GET /api/participate/run/list/:id', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of user for the run 5', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/participate/run/user/list/5')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
		
		it('should return list of user for a not existing run', function(done) {
            agent
                .get('http://localhost:' + settings.port + '/api/participate/run/user/list/5646')
                .end(function (err, res) {
					var emptyObject = [];
					console.log(res.body);
					assert.deepEqual(res.body, emptyObject);
					return done();
                });
        });
    });
	
	describe('POST /api/participate/add', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should add current user to the run 2', function(done) {
            var run = {
				runId: 2
			};
			agent
                .post('http://localhost:' + settings.port + '/api/participate/add')
				.send(run)
                .end(function (err, res) {
					assert.equal(res.body.msg, 'addParticipate');
					agent
						.get('http://localhost:' + settings.port + '/api/participate/user/list')
						.end(function (err, res) {
							assert.equal(res.body.length, 5);
							return done();
						});
                });
        });
		
		it('should failed to add current user to an unexisting run', function(done) {
            var run = {
				runId: 4682
			};
			agent
                .post('http://localhost:' + settings.port + '/api/participate/add')
				.send(run)
                .end(function (err, res) {
					assert.equal(res.body.msg, 'notAbleParticipate');
					return done();
                });
        });
    });
});
