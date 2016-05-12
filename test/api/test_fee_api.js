/**
 * Created by jeremy on 14/04/2016.
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

describe('Test of fee API', function () {
    // Recreate the database at the beginning of testing session
    before(function (done) {
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test API fee over !');
    });


    describe('GET /api/fee/:runId', function () {
        var agent = superagent.agent();

        before(loginUser(agent));
        it('should return fees for run 1 for user 1', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/fee/1')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.percentage, 0.12);
                    assert.equal(res.body.msg.value, 1);
                    assert.equal(res.body.msg.discount, 0.10);
                    return done();
                });
        });
    });

    describe('GET /api/admin/fees', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should return list of active fees', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/fees')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.length, 5);
                    return done();
                });
        });

        it('should get default fee', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/admin/default/fee')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.id, 1);
                    assert.isNull(res.body.msg.code);
                    assert.equal(res.body.msg.percentage, 0.12);
                    assert.equal(res.body.msg.value, 1);
                    assert.isNull(res.body.msg.discount);
                    assert.isNull(res.body.msg.remaining);
                    assert.isNull(res.body.msg.RunId);
                    assert.isNull(res.body.msg.UserId);
                    return done();
                });
        });
    });

    describe('POST /api/admin/fee', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should create fee run 3', function(done) {
            var newFee = {
                code: null,
                percentage: 0.18,
                value: 1.5,
                discount: null,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 5
            };
            
            agent
                .post('http://localhost:' + settings.port + '/api/admin/fee')
                .send({fee: newFee})
                .end(function (err, res) {
                    if(err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.percentage, 0.18);
                    assert.equal(res.body.msg.value, 1.5);
                    assert.isNull(res.body.msg.discount);
                    assert.isNull(res.body.msg.end_date);
                    assert.isNull(res.body.msg.UserId);
                    assert.equal(res.body.msg.RunId, 5);
                    agent
                        .get('http://localhost:' + settings.port + '/api/admin/fees')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.body.type, 'success');
                            assert.equal(res.body.msg.length, 6);
                            agent
                                .get('http://localhost:' + settings.port + '/api/fee/1')
                                .end(function (err, res) {
                                    if (err) return done(err);
                                    assert.equal(res.body.type, 'success');
                                    assert.equal(res.body.msg.percentage, 0.18);
                                    assert.equal(res.body.msg.value, 1.5);
                                    assert.equal(res.body.msg.discount, 0.10);
                                    return done();
                                });
                    });
                });
        });
    });

    describe('PUT /api/admin/fee', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should update fee 2', function(done) {
            var updateFee = {
                id: 2,
                code: null,
                percentage: 0.2,
                value: 6,
                discount: 0.8,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 4
            };

            agent
                .put('http://localhost:' + settings.port + '/api/admin/fee')
                .send({fee: updateFee})
                .end(function (err, res) {
                    if(err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.percentage, 0.2);
                    assert.equal(res.body.msg.value, 6);
                    assert.equal(res.body.msg.discount, 0.8);
                    assert.isNull(res.body.msg.end_date);
                    assert.isNull(res.body.msg.UserId);
                    assert.equal(res.body.msg.RunId, 4);
                    agent
                        .get('http://localhost:' + settings.port + '/api/fee/5')
                        .end(function (err, res) {
                            if (err) return done(err);
                            assert.equal(res.body.type, 'success');
                            assert.equal(res.body.msg.percentage, 0.2);
                            assert.equal(res.body.msg.value, 6);
                            assert.equal(res.body.msg.discount, 0.8);
                            return done();
                        });
                });
        });
    });

    describe('DELETE /api/admin/fee/:id', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should delete fee from fee list', function (done) {
            agent
                .del('http://localhost:' + settings.port + '/api/admin/fee/4')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.isNotNull(res.body.msg.end_date);
                    return done();
                });
        });
    });

    describe('GET /api/fee/check/:code', function () {
        var agent = superagent.agent();

        before(loginUser(agent));

        it('should check code viability on an existing code', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/fee/check/MRT-JR-2016')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.equal(res.body.msg.id, 8);
                    assert.equal(res.body.msg.discount, 0.20);
                    return done();
                });
        });

        it('should check code viability on an expired code', function (done) {
            agent
                .get('http://localhost:' + settings.port + '/api/fee/check/MRT-JR-2015')
                .end(function (err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.type, 'success');
                    assert.isNull(res.body.msg.id);
                    assert.isNull(res.body.msg.discount);
                    return done();
                });
        });
    });
});