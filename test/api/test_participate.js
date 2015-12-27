/**
 * Created by jeremy on 06/02/15.
 */

'use strict';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Participate = require('../../server/objects/participate');
var settings = require('../../conf/config');

describe('Test of participate object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of participate over !');
    });

    it('Get list user participate a run', function (done) {
        var participate = new Participate();
        participate.userRunList(5, function (err, users) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(users.length, 2);
            participate.userRunList(-1, function (err, users) {
                assert.isNotNull(err);
                return done();
            });
        });
    });

    it('Get list of participate a user', function (done) {
        var participate = new Participate();
        participate.userList(1, function (err, runs) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(runs.length, 4);
            participate.userList(-1, function (err, runs) {
                assert.isNotNull(err);
                return done();
            });
        });
    });

    it('Add participate to a user', function (done) {
        var participate = new Participate(),
            runId = 4,
            user = {
                id: 2
            },
            participe = {
                userId: 2,
                runId : 4,
                createdAt: '2015-01-26 10:43:40',
                updatedAt: '2015-01-26 10:43:40'
            };
        participate.set(participe);
        var tmp = participate.get();
        assert.equal(tmp.userId, 2);
        assert.equal(tmp.runId, 4);
        participate.add(runId, user, function (err, participate) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(participate.id, 6);
            assert.equal(participate.UserId, 2);
            assert.equal(participate.RunId, 4);
            return done();
        });
    });

    it('Get list of participate for a user', function (done) {
        var participate = new Participate(),
            run = {
                id: 5,
                name: 'Test'
            },
            journey = {
                journeyId: 3,
                journeyStart: 'Luzarches',
                PartnerId: 1
            };
        participate.notify(run, journey, function (err, notif) {
            if (err) return done(err);
            assert.isNull(err);
            assert.equal(notif.length, 2);
            assert.equal(notif[0].User.firstname, 'Jeremy');
            assert.equal(notif[0].User.lastname, 'Billay');
            assert.equal(notif[0].User.email, 'jbillay@gmail.com');
            return done();
        });
    });
});