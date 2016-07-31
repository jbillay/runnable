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

    it('Create and get picture object', function (done) {
        var picture = new Picture(),
            newPicture = {
                id: 4,
                link: 'http://res.cloudinary.com/myruntrip/image/upload/v1456596630/Run_72_Picture_2_test.jpg',
                default: true,
                createdAt: '2016-02-23 00:00:00',
                updatedAt: '2016-02-23 00:00:00'
            };

        picture.set(newPicture);
        var retrievePicture = picture.get();
        assert.equal(retrievePicture.id, 4);
        assert.equal(retrievePicture.link, 'http://res.cloudinary.com/myruntrip/image/upload/v1456596630/Run_72_Picture_2_test.jpg');
        assert.isTrue(retrievePicture.default);
        assert.equal(retrievePicture.createdAt, '2016-02-23 00:00:00');
        assert.equal(retrievePicture.updatedAt, '2016-02-23 00:00:00');
        return done();
    });
    it('Create new image as default for the run 1', function (done) {
        this.timeout(10000);
        var picture = new Picture(),
            fakeFile = path.normalize(path.join(__dirname, '/fixtures/myruntrip.jpg')),
            targetFile = path.normalize(path.join(__dirname, '../myruntrip.jpg'));
        fs.createReadStream(fakeFile).pipe(fs.createWriteStream(targetFile));
        picture.create(targetFile, 1)
            .then(function (newPicture) {
                assert.equal(newPicture.id, 4);
                assert.isFalse(newPicture.default);
                assert.match(newPicture.link, /^http:\/\/res\.cloudinary\.com\/myruntrip.*Run_1_Picture_4_test.*/);
                picture.getList(1)
                    .then(function (pictures) {
                        assert.equal(pictures.length, 3);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Set image id 2 as default', function (done) {
        var picture = new Picture();

        picture.setDefault(2, 1)
            .then(function (newPicture) {
                assert.equal(newPicture.default, true);
                picture.getList(1)
                    .then(function (pictures) {
                        assert.equal(pictures.length, 3);
                        assert.equal(pictures[0].default, false);
                        assert.equal(pictures[1].default, true);
                        assert.equal(pictures[2].default, false);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Get images for run 1 and 2', function (done) {
        var picture = new Picture();

        picture.getList(1)
            .then(function (pictures) {
                assert.equal(pictures.length, 3);
                picture.getList(2)
                    .then(function (pictures) {
                        assert.equal(pictures.length, 1);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Get image id 4', function (done) {
        var picture = new Picture();

        picture.retrieve(4)
            .then(function (picture) {
                assert.equal(picture.id, 4);
                assert.isFalse(picture.default);
                assert.match(picture.link, /^http:\/\/res\.cloudinary\.com\/myruntrip.*Run_1_Picture_4_test.*/);
                return done();
            })
            .catch(function (err) {
                return done(err);
            });
    });

    it('Remove image with id 4', function (done) {
        this.timeout(6000);
        var picture = new Picture();

        picture.remove(4)
            .then(function (oldPicture) {
                assert.equal(oldPicture.result, 'ok');
                picture.getList(1)
                    .then(function (pictures) {
                        assert.equal(pictures.length, 2);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            })
            .catch(function (err) {
                return done(err);
            });
    });
});