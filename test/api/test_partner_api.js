/**
 * Created by jeremy on 17/12/2015.
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

describe('Test of partner API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
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

    describe('POST /api/admin/partner/info', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should send information to partner 1', function (done) {
            var partner = {
                id: 1
            };
            agent
                .post('http://localhost:' + settings.port + '/api/admin/partner/info')
                .send({partner: partner})
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    }
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg, 'Partner info sent');
                    return done();
                });
        });
    });
});

