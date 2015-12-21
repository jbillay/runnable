/**
 * Created by jeremy on 17/12/2015.
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


describe('Test of partner API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        this.timeout(settings.timeout);
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
                        var fixtures = require('./fixtures/partner.json');
                        var promises = [];
                        fixtures.forEach(function (fix) {
                            promises.push(loadData(fix));
                        });
                        q.all(promises).then(function () {
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
        console.log('Test of API partner over !');
    });

    describe('POST /api/admin/partner', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create a new partner', function (done) {
            var partner = {
                name: 'My Run Trip',
                expiry: '2019-10-12',
                fee: 10,
                userId: 1
            };
            agent
                .post('http://localhost:' + settings.port + '/api/admin/partner')
                .send({partner: partner})
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    }
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.name, 'My Run Trip');
                    assert.isNotNull(res.body.msg.token);
                    return done();
                });
        });
    });

    describe('GET /api/admin/partners', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return all partners', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/partners')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/admin/partner/:token', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return the partner for a token', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/partner/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNjcsImV4cCI6MTIwNTA5NDE5NzR9.fikQ6L2eYUBujEeV-OYMFfX_pER5eC2Z_nQJ0YVyb9w')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.id, 2);
                    assert.equal(res.body.msg.name, 'I-Run');
                    assert.equal(res.body.msg.fee, 8.2);
                    return done();
                });
        });
    });

});

