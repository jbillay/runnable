/**
 * Created by jeremy on 10/02/15.
 */
/**
 * Created by jeremy on 04/02/15.
 */

var request = require('supertest'),
    models = require('../models'),
    assert = require("chai").assert,
    app = require('../../server.js');

describe('Test of root API', function () {

    after(function () {
        console.log("Test API root over !");
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
                .expect(302, done);
        });
        it('should return redirect /', function (done) {
            request(app)
                .get('/logout')
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.header.location, '/');
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
                    if (err) {
                        return done(err);
                    }
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

    describe('GET /api/send/mail', function () {
        it('Should send an email', function (done) {
            request(app)
                .post('/api/send/mail')
                .send({ confirm: 'message envoyé', emails: 'jbillay@gmail.com,richard.couret@free.fr', message: 'test'})
                .end(function (err, res) {
                    assert.equal(JSON.parse(res.body).msg, 'message envoyé');
                    return done();
                });
        });
    });
});