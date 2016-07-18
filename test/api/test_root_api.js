/**
 * Created by jeremy on 10/02/15.
 */
/**
 * Created by jeremy on 04/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

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

describe('Test of root API', function () {
    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });

    after(function () {
        console.log('Test API root over !');
    });

    describe('GET /', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/')
                .expect(200, done);
        });
        it('should return default.html', function (done) {
            request(app)
                .get('/')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.include(res.text, 'runnable_root');
                    return done();
                });
        });
    });

    describe('GET /logout', function () {
        it('should return code 302', function (done) {
            request(app)
                .get('/logout')
                .expect(200, done);
        });
        it('should return redirect /', function (done) {
            request(app)
                .get('/logout')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg, 'userLogoff');
                    return done();
                });
        });
    });

    describe('GET /sync', function () {
        it('should return code 302', function (done) {
            request(app)
                .get('/sync')
                .expect(302, done);
        });
        it('should return redirect /', function (done) {
            request(app)
                .get('/sync')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.header.location, '/');
                    return done();
                });
        });
    });

    describe('GET /partials/:name', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/partials/index')
                .expect(200, done);
        });
    });

    describe('POST /api/send/mail', function () {
        it('Should send an email', function (done) {
            request(app)
                .post('/api/send/mail')
                .send({ confirm: 'message envoyé', emails: 'jbillay@gmail.com,richard.couret@free.fr', message: 'test'})
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'message envoyé');
                    return done();
                });
        });
    });

    describe('POST /api/admin/sendMail', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('Should send an email', function (done) {
            var template = {
                name: 'mailTest',
                values: {
                    nom: 'Billay',
                    prenom: 'Jeremy'
                },
                email: 'jeremy.billay@myruntrip.com'
            };
            agent
                .post('http://localhost:' + settings.port + '/api/admin/sendMail')
                .send({template: template})
                .end(function (err, res) {
                    assert.equal(res.body.msg, 'Message not sent as configured');
                    return done();
                });
        });
    });

    describe('GET /api/version', function () {
        it('Should return version', function (done) {
            request(app)
                .get('/api/version')
                .end(function (err, res) {
                    assert.equal(res.body, 'DEV');
                    return done();
                });
        });
    });
});