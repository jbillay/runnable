/**
 * Created by jeremy on 04/02/15.
 */
'use strict';

var request = require('supertest'),
    models = require('../models'),
    assert = require('chai').assert,
    app = require('../../server.js'),
    async = require('async'),
    q = require('q'),
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
            .post('http://localhost:9615/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);
    };
}


describe('Test of page API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        this.timeout(6000);
        models.sequelize.sync({force: true})
            .then(function () {
                async.waterfall([
                    function(callback) {
                        var fixtures = require('./fixtures/users.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function() {
                            callback(null);
                        });
                    },
                    function(callback) {
                        var fixtures = require('./fixtures/pages.json');
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
        console.log('Test of API page over !');
    });
	
	describe('GET /api/page/:tag', function () {
		var agent = superagent.agent();

        before(loginUser(agent));
		
		it('should return page with tag test', function (done) {
            agent
                .get('http://localhost:9615/api/page/test')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.id, 1);
                    assert.equal(res.body.title, 'Page de test');
                    assert.equal(res.body.tag, 'test');
                    assert.equal(res.body.content, 'HTML TEXT');
                    return done();
                });
        });
    });

    describe('GET /api/admin/pages', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return all pages', function (done) {
            agent
                .get('http://localhost:9615/api/admin/pages')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('POST /api/admin/page', function () {
		var agent = superagent.agent();

        before(loginUser(agent));
		
		it('should create a new page', function (done) {
			var newPage = {
                title: 'Test during unit test',
                tag: 'test-during-unit-test',
                content: 'Test during unit test HTML CONTENT'
            };
            agent
                .post('http://localhost:9615/api/admin/page')
				.send(newPage)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.msg, 'pageSaved');
					agent
						.get('http://localhost:9615/api/page/test-during-unit-test')
						.end(function (err, res) {
							if (err) {
								return done(err);
							}
							assert.equal(res.body.id, 3);
							assert.equal(res.body.title, 'Test during unit test');
							assert.equal(res.body.tag, 'test-during-unit-test');
							assert.equal(res.body.content, 'Test during unit test HTML CONTENT');
							return done();
						});
                });
        });
    });
	
	describe('POST /api/admin/page', function () {
		var agent = superagent.agent();

        before(loginUser(agent));
		
		it('should save an existing page', function (done) {
			agent
				.get('http://localhost:9615/api/page/toto')
				.end(function (err, res) {
					if (err) {
						return done(err);
					}
					assert.equal(res.body.id, 2);
					assert.equal(res.body.title, 'Page pour toto');
					assert.equal(res.body.tag, 'toto');
					assert.equal(res.body.content, 'ENCORE UN TEST');
					var modifiedPage = res.body;
						modifiedPage.content  = '<div>encore un test</div>';
					agent
						.post('http://localhost:9615/api/admin/page')
						.send(modifiedPage)
						.end(function (err, res) {
							if (err) {
								return done(err);
							}
							assert.equal(res.body.msg, 'pageSaved');
							return done();
						});
				});
		});
    });
});
	
	