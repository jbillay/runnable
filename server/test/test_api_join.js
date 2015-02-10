/**
 * Created by jeremy on 10/02/15.
 */
/**
 * Created by jeremy on 07/02/15.
 */

var request = require('supertest'),
    models = require('../models'),
    assert = require("chai").assert,
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


describe('Test of join API', function () {

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
        console.log("Test API user over !");
    });

    describe('GET /api/join/journey/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/join/journey/2')
                .expect(200, done);
        });
        it('should return joins for run 2', function (done) {
            request(app)
                .get('/api/join/journey/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 2);
                    done();
                });
        });
    });

    describe('GET /api/join/:id', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return join 1 info', function(done) {
            agent
                .get('http://localhost:9615/api/join/1')
                .end(function (err, res) {
                    assert.equal(res.body.nb_place_outward, 2);
                    assert.equal(res.body.nb_place_return, 3);
                    assert.equal(res.body.status, 'pending');
                    assert.equal(res.body.UserId, 1);
                    assert.equal(res.body.JourneyId, 1);
                    return done();
                });
        });
    });

    describe('GET /api/admin/joins', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of all joins', function(done) {
            agent
                .get('http://localhost:9615/api/admin/joins')
                .end(function (err, res) {
                    assert.equal(res.body.length, 4);
                    return done();
                });
        });
    });
});

function loginUser(agent) {
    return function(done) {
        agent
            .post('http://localhost:9615/login')
            .send({ email: 'jbillay@gmail.com', password: 'noofs' })
            .end(onResponse);

        function onResponse(err, res) {
            return done();
        }
    };
}