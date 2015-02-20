/**
 * Created by jeremy on 07/02/15.
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

describe('Test of user API', function () {

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
        console.log('Test API user over !');
    });

    describe('GET /api/user/public/info/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/user/public/info/1')
                .expect(200, done);
        });
        it('should return public info on user 1', function (done) {
            request(app)
                .get('/api/user/public/info/1')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.firstname, 'Jeremy');
                    assert.equal(res.body.lastname, 'Billay');
                    assert.equal(res.body.address, 'Saint Germain en laye');
                    assert.equal(res.body.phone, '0689876547');
                    assert.equal(res.body.email, 'jbillay@gmail.com');
                    assert.equal(res.body.isActive, 1);
                    assert.equal(res.body.role, 'admin');
                    done();
                });
        });
    });

    describe('GET /api/user/public/driver/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/user/public/driver/2')
                .expect(200, done);
        });
        it('should return public driver info on user 2', function (done) {
            request(app)
                .get('/api/user/public/driver/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0].rate_driver, 3);
                    assert.equal(res.body[0].rate_service, 5);
                    assert.equal(res.body[0].UserId, 1);
                    done();
                });
        });
    });

    describe('POST /api/user', function () {
        it('should return code 200', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test'
            };
            request(app)
                .post('/api/user')
                .send(user)
                .expect(200, done);
        });
        it('should return a new user', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test'
            };
            var user2 = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test1'
            };
            request(app)
                .post('/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'accountCreated');
                    done();
                });
        });

        it('should return an error for different password', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test1'
            };
            request(app)
                .post('/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'wrongPassword');
                    done();
                });
        });

        it('should return an error for existing user', function (done) {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'jbillay@gmail.com',
                password : 'test',
                password_confirmation : 'test'
            };
            request(app)
                .post('/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'existingAccount');
                    done();
                });
        });
    });

    describe('GET /login', function () {
        it('should return code 200', function (done) {
            request(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.com', password: 'noofs' })
                .expect(200, done);
        });

        it('Should get user information after login', function (done) {
            request(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.com', password: 'noofs' })
                .end(function (err, res) {
                    assert.equal(res.body.id, 1);
                    assert.equal(res.body.firstname, 'Jeremy');
                    assert.equal(res.body.lastname, 'Billay');
                    assert.equal(res.body.address, 'Saint Germain en laye');
                    assert.equal(res.body.phone, '0689876547');
                    assert.equal(res.body.email, 'jbillay@gmail.com');
                    assert.equal(res.body.role, 'admin');
                    done();
                });
        });

        it('Should not be logging due to wrong email', function (done) {
            request(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.fr', password: 'noofs' })
                .end(function (err, res) {
                    var obj = {};
                    assert.deepEqual(res.body, obj);
                    done();
                });
        });

        it('Should not be logging due to wrong password', function (done) {
            request(app)
                .post('/login')
                .send({ email: 'jbillay@gmail.com', password: 'test' })
                .end(function (err, res) {
                    var obj = {};
                    assert.deepEqual(res.body, obj);
                    done();
                });
        });
    });

    describe('GET /api/user/me', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get user information', function(done) {
            agent
                .get('http://localhost:9615/api/user/me')
                .end(function(err, res) {
                    assert.equal(res.body.id, 1);
                    assert.equal(res.body.firstname, 'Jeremy');
                    assert.equal(res.body.lastname, 'Billay');
                    assert.equal(res.body.address, 'Saint Germain en laye');
                    assert.equal(res.body.phone, '0689876547');
                    assert.equal(res.body.email, 'jbillay@gmail.com');
                    assert.equal(res.body.role, 'admin');
                    return done();
                });
        });
    });

    describe('GET /api/user/journeys', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get user journeys', function(done) {
            agent
                .get('http://localhost:9615/api/user/journeys')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/user/joins', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get user joins', function(done) {
            agent
                .get('http://localhost:9615/api/user/joins')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/user/password/update', function () {
        var agent = superagent.agent();

        it('Should not update the user password as not logging', function(done) {
            var anon = superagent.agent();
            anon
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'noofs', new: 'test', newConfirm: 'test'}})
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'notAuthenticated');
                    done();
                });
        });

        before(loginUser(agent));

        it('Should update the user password', function(done) {
            agent
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'noofs', new: 'test', newConfirm: 'test'}})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'passwordUpdated');
                    done();
                });
        });

        it('Should not update the user password due to wrong old password', function(done) {
            agent
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'kjdhkqshdk', new: 'test', newConfirm: 'test'}})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'passwordWrong');
                    done();
                });
        });

        it('Should not update the user password due to different new passwords', function(done) {
            agent
                .post('http://localhost:9615/api/user/password/update')
                .send({ passwords: {old: 'noofs', new: 'test', newConfirm: 'test1'}})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'passwordDifferent');
                    done();
                });
        });
    });

    describe('GET /api/admin/users', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should get list of users', function(done) {
            agent
                .get('http://localhost:9615/api/admin/users')
                .end(function (err, res) {
                    assert.equal(res.body.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/admin/user/active', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should define user 2 as active', function(done) {
            agent
                .post('http://localhost:9615/api/admin/user/active')
                .send({id: '2'})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'userToggleActive');
                    request(app)
                        .get('/api/user/public/info/2')
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert.equal(res.body.isActive, 1);
                        });
                    return done();
                });
        });
    });

    describe('GET /api/user/runs', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return user run from web', function (done) {
            // TODO: mock the call to itra website
            agent
                .get('http://localhost:9615/api/user/runs')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    console.log(res.body);
                    assert.isNotNull(res.body);
                    done();
                });
        });
    });

    describe('GET /api/user/invite', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should send email to friends of user 1', function (done) {
            agent
                .post('http://localhost:9615/api/user/invite')
                .send({emails: 'jbillay@gmail.com, richard.couret@free.fr', message: 'should send email to friends'})
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'Invitation(s) envoyée(s)');
                    done();
                });
        });
    });

    describe('GET /api/user/password/reset', function () {
        it('should return code 302', function (done) {
            request(app)
                .post('/api/user/password/reset')
                .send({ email: 'jbillay@gmail.com'})
                .expect(302, done);
        });

        it('Should reset user password', function (done) {
            var agent = superagent.agent();

            request(app)
                .post('/api/user/password/reset')
                .send({ email: 'jbillay@gmail.com'})
                .end(function (err, res) {
                    assert.equal(res.header.location, '/');
                    agent
                        .post('http://localhost:9615/login')
                        .send({ email: 'jbillay@gmail.com', password: 'noofs' })
                        .end(function (err, res) {
                            assert.isNull(err);
                            assert.equal(res.statusCode, 401);
                            done();
                        });
                });
        });
    });

    describe('GET /api/user/active/:id/:hash', function () {
        it('should active the user 2', function (done) {
            request(app)
                .get('/api/user/public/info/2')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.notOk(res.body.isActive);
                    var hash = new Date(res.body.createdAt).getTime().toString();
                    request(app)
                        .get('/api/user/active/2/' + hash)
                        .end(function (err, res) {
                            assert.isNull(err);
                            assert.equal(res.header.location, '/');
                            done();
                        });
                });
        });
    });

    describe('PUT /api/user', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should update user information', function (done) {
            var user = {
                firstname : 'Jeremy',
                lastname : 'Billay',
                address : 'Chantilly',
                phone: '0987654321',
                email : 'jbillay@gmail.com'
            };
            agent
                .put('http://localhost:9615/api/user')
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(JSON.parse(res.body).msg, 'accountUpdated');
                    agent
                        .get('http://localhost:9615/api/user/me')
                        .end(function(err, res) {
                            assert.equal(res.body.id, 1);
                            assert.equal(res.body.firstname, 'Jeremy');
                            assert.equal(res.body.lastname, 'Billay');
                            assert.equal(res.body.address, 'Chantilly');
                            assert.equal(res.body.phone, '0987654321');
                            assert.equal(res.body.email, 'jbillay@gmail.com');
                            assert.equal(res.body.role, 'admin');
                            return done();
                        });
                });
        });
    });
});

