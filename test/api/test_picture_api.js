/**
 * Created by jeremy on 06/02/2016.
 */

'use strict';

process.env.NODE_ENV = 'test';

var request = require('supertest'),
    fs = require('fs'),
    path = require('path'),
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

describe('Test of picture API', function () {
        // Recreate the database at the beginning of testing session
    before(function (done) {
        this.timeout(6000);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API picture over !');
    });

    describe('GET /api/pictures/:runId', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/pictures/1')
                .expect(200, done);
        });
        it('should return pictures for run 1', function (done) {
            request(app)
                .get('/api/pictures/1')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.length, 2);
                    return done();
                });
        });
    });

    describe('GET /api/picture/:id', function () {
        it('should return code 200', function (done) {
            request(app)
                .get('/api/picture/3')
                .expect(200, done);
        });
        it('should return picture 3', function (done) {
            request(app)
                .get('/api/picture/3')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.id, 3);
                    assert.isTrue(res.body.msg.default);
                    assert.match(res.body.msg.link, /^http:\/\/res\.cloudinary\.com\/myruntrip.*Run_2_Picture_3_test.*/);
                    return done();
                });
        });
    });
    describe('POST /api/pictures/:runId', function () {
        this.timeout(6000);
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create picture run 1', function(done) {
            var filename = 'myruntrip.jpg',
                boundary = Math.random();
            var req = agent.post('http://localhost:' + settings.port + '/api/picture/1');
            req.set('Content-Type', 'multipart/form-data; boundary=' + boundary);
            req.write('--' + boundary + '\r\n');
            req.write('Content-Disposition: form-data; name="file"; filename="'+filename+'"\r\n');
            req.write('Content-Type: application/octet-stream\r\n');
            req.write('\r\n');
            req.write(fs.readFileSync(path.normalize(path.join(__dirname, '/fixtures/' + filename))));
            req.write('\r\n--' + boundary + '--');
            req.end(function (err, res) {
                assert.equal(res.body.msg.id, 4);
                assert.isFalse(res.body.msg.default);
                assert.match(res.body.msg.link, /^http:\/\/res\.cloudinary\.com\/myruntrip.*Run_1_Picture_4_test.*/);
                assert.equal(res.body.msg.RunId, 1);
                return done();
            });
        });
    });

    describe('GET /api/picture/delete/:id', function () {
        this.timeout(6000);
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should try to delete file which is not exist', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/picture/delete/19')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'error');
                    assert.equal(res.body.msg, 'runPictureNotRemove');
                    return done();
                });
        });

        it('should delete picture 4', function(done) {
            request(app)
                .get('/api/pictures/1')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.length, 3);
                    agent
                        .get('http://localhost:' + settings.port + '/api/picture/delete/4')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.body.type, 'success');
                            assert.propertyVal(res.body.msg, 'result', 'ok');
                            request(app)
                                .get('/api/pictures/1')
                                .end(function (err, res) {
                                    if (err) return done(err);
                                    assert.equal(res.body.type, 'success');
                                    assert.equal(res.body.msg.length, 2);
                                    return done();
                                });
                        });
                });
        });
    });
});