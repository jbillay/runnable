/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Picture = require('../../server/objects/picture');
var settings = require('../../conf/config');
var sinon = require('sinon');
var q = require('q');
var fs = require('fs');
var path = require('path');

describe('Test of picture object', function () {
    before(function (done) {
        this.timeout(6000);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of picture over !');
    });

    it('Create new image as default for the run 1', function (done) {
        this.timeout(6000);
        var picture = new Picture(),
            fakeFile = path.normalize(path.join(__dirname, '/fixtures/myruntrip.jpg')),
            targetFile = path.normalize(path.join(__dirname, '../myruntrip.jpg'));
        fs.createReadStream(fakeFile).pipe(fs.createWriteStream(targetFile));
        picture.create(targetFile, 1, 1)
            .then(function (picture) {
                assert.equal(picture.id, 1);
                assert.isTrue(picture.default);
                assert.match(picture.link, /^http:\/\/res\.cloudinary\.com\/myruntrip.*Run_1_Picture_1_test.*/);
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Remove image with id 1', function (done) {
        this.timeout(6000);
        var picture = new Picture();

        picture.remove(1)
            .then(function (result) {
                assert.equal(result.result, 'ok');
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
    });
});