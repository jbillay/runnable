/**
 * Created by jeremy on 31/01/15.
 */

'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var User = require('../../server/objects/user');
var request = require('request');
var sinon = require('sinon');
var settings = require('../../conf/config');
var fs = require('fs');
var path = require('path');
var cloudinary = require('cloudinary');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of user object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        var fakeTime = new Date(2015, 6, 6, 0, 0, 0, 0).getTime();
        sinon.clock = sinon.useFakeTimers(fakeTime, 'Date');
        this.timeout(settings.timeout);
        models.loadFixture(done);
    });

    afterEach(function() {
        // runs after each test in this block
        sinon.clock.restore();
    });

    var html = '<tbody><tr class="odd"><td><a href="?id=340083&nom=COURET#tab">Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr><td><a href="?id=78273&nom=COURET#tab">Jacques-Andre COURET</a></td><td>Homme</td><td>France</td><td>1965</td></tr><tr class="odd"><td><a href="?id=267249&nom=COURET#tab">Jaques Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr><td><a href="?id=437314&nom=COURET#tab">Nicolas COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr class="odd"><td><a href="?id=84500&nom=COURET#tab">Richard COURET</a></td><td>Homme</td><td>France</td><td>1980</td></tr><tr><td><a href="?id=489223&nom=DUCOURET#tab">Fabien DUCOURET</a></td><td>Homme</td><td>France</td><td>1978</td></tr><tr class="odd"><td><a href="?id=475698&nom=PICOURET#tab">Apollo PICOURET</a></td><td>Homme</td><td>France</td><td>1985</td></tr>				</tbody>';
    cloudinary.config({
        cloud_name: settings.cloudinary.cloud_name,
        api_key: settings.cloudinary.api_key,
        api_secret: settings.cloudinary.api_secret
    });

    before(function(done){
        sinon
            .stub(request, 'get')
            .yields(null, null, html);
        done();
    });

    //After all the tests have run, output all the sequelize logging.
    after(function (done) {
        request.get.restore();
        console.log('Test of user over !');
        done();
    });

    describe('Test with local database', function () {
        it('Get feedback on driver', function (done) {
            var user = new User();
            user.getPublicDriverInfo(2, function (err, feedback) {
                if (err) return done(err);
                assert.equal(feedback.length, 1);
                assert.equal(feedback[0].rate_driver, 3);
                assert.equal(feedback[0].rate_service, 5);
                assert.equal(feedback[0].UserId, 1);
                user.getPublicDriverInfo(-10, function (err, user) {
                    assert.isNotNull(err);
                    done();
                });
            });
        });

        it('Get user public info', function (done) {
            var user = new User();
            user.getPublicInfo(2, function (err, userInfo) {
                if (err) return done(err);
                assert.equal(userInfo.firstname, 'Richard');
                assert.equal(userInfo.lastname, 'Couret');
                assert.equal(userInfo.address, 'Bouffemont');
                assert.equal(userInfo.phone, '0689876547');
                assert.equal(userInfo.email, 'richard.couret@free.fr');
                assert.equal(userInfo.isActive, 0);
                assert.equal(userInfo.role, 'editor');
                assert.equal(userInfo.Journeys.length, 1);
                assert.equal(userInfo.Participates.length, 1);
                user.getPublicInfo(3, function (err, userInfo) {
                    if (err) return done(err);
                    assert.equal(userInfo.firstname, 'Toto');
                    assert.equal(userInfo.lastname, 'Titi');
                    assert.equal(userInfo.address, 'Nantes');
                    assert.equal(userInfo.email, 'toto.titi@tata.fr');
                    assert.equal(userInfo.isActive, 1);
                    assert.equal(userInfo.role, 'user');
                    user.getPublicInfo(1, function (err, userInfo) {
                        if (err) return done(err);
                        assert.equal(userInfo.Participates.length, 3);
                        user.getPublicInfo(-10, function (err, user) {
                            assert.isNotNull(err);
                            return done();
                        });
                    });
                });
            });
        });

        it('Toggle active flag for a user', function (done) {
            var user = new User();
            user.toggleActive(1, function (err, userChanged) {
                if (err) return done(err);
                assert.equal(userChanged.firstname, 'Jeremy');
                assert.equal(userChanged.lastname, 'Billay');
                assert.equal(userChanged.address, 'Saint Germain en laye');
                assert.equal(userChanged.phone, '0689876547');
                assert.equal(userChanged.email, 'jbillay@gmail.com');
                assert.equal(userChanged.isActive, 0);
                assert.equal(userChanged.role, 'admin');
                user.toggleActive(1, function (err, userChanged) {
                    assert.equal(userChanged.isActive, 1);
                    user.toggleActive(-1, function (err, userChanged) {
                        assert.isNotNull(err);
                        done();
                    });
                });
            });
        });

        it('Update password for a user', function (done) {
            var user = new User();
            user.updatePassword('jbillay@gmail.com', 'test', function (err, userChanged) {
                if (err) return done(err);
                assert.equal(userChanged.firstname, 'Jeremy');
                assert.equal(userChanged.lastname, 'Billay');
                assert.equal(userChanged.address, 'Saint Germain en laye');
                assert.equal(userChanged.phone, '0689876547');
                assert.equal(userChanged.email, 'jbillay@gmail.com');
                assert.equal(userChanged.role, 'admin');
                assert.notEqual(userChanged.hashedPassword, '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==');
                assert.notEqual(userChanged.salt, 'T75xyNJfL19hzc778A08HQ==');
                user.updatePassword(4, 'test', function (err, userChanged) {
                    assert.isNotNull(err);
                    user.updatePassword('jbillay@gmail.com', null, function (err, userChanged) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });

        it('Get user list', function (done) {
            var user = new User();
            user.getList(function (err, userList) {
                if (err) return done(err);
                assert.equal(userList.length, 3);
                return done();
            });
        });

        it('Get user by email', function (done) {
            var user = new User();
            user.getByEmail('jbillay@gmail.com', function (err, userDetail) {
                if (err) return done(err);
                assert.equal(userDetail.firstname, 'Jeremy');
                assert.equal(userDetail.lastname, 'Billay');
                assert.equal(userDetail.address, 'Saint Germain en laye');
                assert.equal(userDetail.phone, '0689876547');
                assert.equal(userDetail.email, 'jbillay@gmail.com');
                assert.equal(userDetail.role, 'admin');
                assert.equal(userDetail.isActive, 1);
                user.getByEmail(-1, function (err, userDetail) {
                    assert.isNotNull(err);
                    done();
                });
            });
        });

        it('Get user by id', function (done) {
            var user = new User();
            user.getById(2, function (err, userDetail) {
                if (err) return done(err);
                assert.equal(userDetail.firstname, 'Richard');
                assert.equal(userDetail.lastname, 'Couret');
                assert.equal(userDetail.address, 'Bouffemont');
                assert.equal(userDetail.email, 'richard.couret@free.fr');
                assert.equal(userDetail.role, 'editor');
                assert.equal(userDetail.isActive, 0);
                user.getById('TOTO', function (err, userDetail) {
                    assert.isNotNull(err);
                    done();
                });
            });
        });

        it('Get not existing user itra info', function (done) {
            var user = new User();
            user.getById(1, function (err, userDetail) {
                if (err) return done(err);
                user.set({});
                user.set(userDetail);
                user.getItraCode(userDetail, function (err, code) {
                    if (err) return done(err);
                    assert.isNull(code);
                    return done();
                });
            });
        });

        it('Get user itra info', function (done) {
            var user = new User();
            user.getById(2, function (err, userDetail) {
                if (err) return done(err);
                user.set(userDetail);
                user.getItraCode(userDetail, function (err, code) {
                    if (err) return done(err);
                    assert.equal(code, '?id=84500&nom=COURET#tab');
                    return done();
                });
            });
        });

        it('Create new user', function (done) {
            var user = new User(),
                newUser = {
                    firstname: 'Emilie',
                    lastname: 'Francisco',
                    address: 'Saint Germain en laye',
                    phone: '0671902307',
                    email: 'emiliefrancisco@hotmail.fr',
                    password: 'test',
                    isActive: 1
                },
                newUser2 = {
                    firstname: 'Test',
                    lastname: 'Test',
                    password: 'test',
                    address: 'Test'
                };
            user.set(newUser);
            var tmp = user.get();
            assert.equal(tmp.firstname, 'Emilie');
            assert.equal(tmp.lastname, 'Francisco');
            assert.equal(tmp.address, 'Saint Germain en laye');
            assert.equal(tmp.phone, '0671902307');
            assert.equal(tmp.password, 'test');
            assert.equal(tmp.email, 'emiliefrancisco@hotmail.fr');
            assert.equal(tmp.role, 'user');
            assert.equal(tmp.isActive, 1);
            user.save(function (err, newUser) {
                if (err) return done(err);
                assert.equal(newUser.firstname, 'Emilie');
                assert.equal(newUser.lastname, 'Francisco');
                assert.equal(newUser.address, 'Saint Germain en laye');
                assert.equal(newUser.phone, '0671902307');
                assert.equal(newUser.email, 'emiliefrancisco@hotmail.fr');
                assert.isAbove(newUser.hashedPassword.length, 0);
                assert.equal(newUser.role, 'user');
                assert.equal(newUser.isActive, 1);
                user.set(newUser2);
                user.save(function (err, newUser) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });

        it('First activation of a user', function (done) {
            var user = new User(),
                newUser = {
                    id: 4,
                    firstname: 'Emilie',
                    lastname: 'Francisco',
                    address: 'Saint Germain en laye',
                    phone: '0671902307',
                    password: 'emilie',
                    email: 'emiliefrancisco@hotmail.fr',
                    isActive: 0,
                    role: 'user',
                    createdAt: '2015-02-04 18:55:39',
                    updatedAt: '2015-02-04 18:55:39'
                };
            user.set(newUser);
            user.save(function (err, createdUser) {
                if (err) return done(err);
                var hash = new Date(createdUser.createdAt).getTime().toString();
                user.activate(createdUser.id, hash, function (err, newUser) {
                    if (err) {
                        console.log('Error: ' + err);
                    }
                    assert.equal(newUser.firstname, 'Emilie');
                    assert.equal(newUser.lastname, 'Francisco');
                    assert.equal(newUser.address, 'Saint Germain en laye');
                    assert.equal(newUser.phone, '0671902307');
                    assert.equal(newUser.email, 'emiliefrancisco@hotmail.fr');
                    assert.equal(newUser.role, 'user');
                    assert.equal(newUser.isActive, 1);
                    user.activate(1, '', function (err, newUser) {
                        assert.isNotNull(err);
                        user.activate(-1, '', function (err, newUser) {
                            assert.isNotNull(err);
                            done();
                        });
                    });
                });
            });
        });

        it('Update a user', function (done) {
            var user = new User(),
                updatedValues = {
                    firstname: 'Jeremy',
                    lastname: 'Billay',
                    address: 'Chantilly',
                    phone: '0647658789',
                    email: 'jbillay@gmail.fr'
                };
            user.update(1, updatedValues, function (err, updatedUser) {
                if (err) return done(err);
                assert.equal(updatedUser.firstname, 'Jeremy');
                assert.equal(updatedUser.lastname, 'Billay');
                assert.equal(updatedUser.address, 'Chantilly');
                assert.equal(updatedUser.phone, '0647658789');
                assert.equal(updatedUser.email, 'jbillay@gmail.fr');
                return done();
            });
        });

        it('Delete user by id', function (done) {
            var user = new User();
            user.delete(2, function (err, res) {
                if (err) return done(err);
                assert.equal(res, 'deleted');
                user.getById(2, function (err, userDetail) {
                    if (err) return done(err);
                    assert.isNull(userDetail);
                    return done();
                });
            });
        });

        it('Delete a not existing user', function (done) {
            var user = new User();
            user.delete(1023, function (err, res) {
                assert.isNotNull(err);
                assert.isNull(res);
                return done();
            });
        });

        // TODO: move that test to integration testing
        it.skip('Save picture for a user', function (done) {
            this.timeout(15000);
            sinon.clock.restore();
            var user = new User(),
                fakeFile = path.normalize(path.join(__dirname, '/fixtures/myruntrip.jpg')),
                targetFile = path.normalize(path.join(__dirname, '../myruntrip.jpg'));
            fs.createReadStream(fakeFile).pipe(fs.createWriteStream(targetFile));
            user.addPicture(1, targetFile, function (err) {
                if (err) return done(err);
                assert.isNull(err);
                user.getById(1, function (err, userDetail) {
                    if (err) return done(err);
                    assert.equal(userDetail.firstname, 'Jeremy');
                    assert.match(userDetail.picture, /^http:\/\/res\.cloudinary\.com\/myruntrip.*avatar_.*_1/);
                    cloudinary.uploader.destroy('avatar_test_1', function(result) {
                        console.log(result);
                        return done();
                    });
                });
            });
        });

        it('Delete picture for a user', function (done) {
            var user = new User();
            user.deletePicture(1, function (err) {
                if (err) return done(err);
                user.getById(1, function (err, userDetail) {
                    if (err) return done(err);
                    assert.equal(userDetail.firstname, 'Jeremy');
                    assert.isNull(userDetail.picture);
                    return done();
                });
            });
        });
    });
    describe('Test with mock', function () {
        describe('Test update', function () {
            it('Should update a user which fail to get user', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.update(1, {}, function (err, user) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not update user!');
                    }
                });
            });
            it('Should update a user which fail to update user info', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    updateAttributes: function (attr) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.update(1, {}, function (err, user) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not update user!');
                    }
                });
            });
        });
        describe('Test save', function () {
            it('Should save a user which fail to get user', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; },
                                            build: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.save(function (err, user) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not update user!');
                    }
                });
            });
            it('Should save a user which fail to save user info', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; },
                                        build: function (params) { return {
                                            id: 1,
                                            makeSalt: function (attr) { return true; },
                                            encryptPassword: function (attr) { return true; },
                                            save: function (attr) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                                            }; }} };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.save(function (err, user) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not update user!');
                    }
                });
            });
        });
        describe('Test activate', function () {
            it('Should activate a user which fail to save user info', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    id: 1,
                    createdAt: '2016-01-27',
                    makeSalt: function (attr) { return true; },
                    encryptPassword: function (attr) { return true; },
                    save: function (attr) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                var hash = new Date('2016-01-27').getTime().toString();
                user.activate(1, hash, function (err, user) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not update user!');
                    }
                });
            });
        });
        describe('Test getList', function () {
            it('Should get list of users which fail to get users', function (done) {
                var stubModel = { User: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.getList(function (err, user) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not update user!');
                    }
                });
            });
        });
        describe('Test delete', function () {
            it('Should delete a users which fail to destroy users', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    destroy: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.delete(1, function (err, user) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not update user!');
                    }
                });
            });
        });
        describe('Test deletePicture', function () {
            it('Should delete picture of a users which fail as user not found', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.deletePicture(1, function (err) {
                    if (err) {
                        assert.equal(err, 'Error: User not found');
                        return done();
                    } else {
                        return done('Should not delete user picture!');
                    }
                });
            });
            it('Should delete a users which fail to destroy users', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel});
                var user = new User();
                user.deletePicture(1, function (err) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not delete user picture!');
                    }
                });
            });
        });
        describe('Test addPicture', function () {
            it('Should add picture for a users which fail as user not found', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); },
                        destroy: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); }
                    }
                };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel, 'cloudinary': stubClouddinary});
                var user = new User();
                user.addPicture(1, 'toto', function (err) {
                    if (err) {
                        assert.equal(err, 'Error: User not found');
                        return done();
                    } else {
                        return done('Should not delete user picture!');
                    }
                });
            });
            it('Should add a users which fail to save user', function (done) {
                var stubModel = { User: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); },
                        destroy: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback('Mock to fail'); } };
                var User = proxyquire('../../server/objects/user', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var user = new User();
                user.addPicture(1, 'toto', function (err) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not delete user picture!');
                    }
                });
            });
        });
        describe('Test getItraCode', function () {
            it('Should get itra code for a users which fail', function (done) {
                var stubItra = function itra() {};
                stubItra.prototype.getCode = function (callback) { return callback('Mock to fail'); };
                stubItra.prototype.getRuns = function (callback) { return callback('Mock to fail'); };
                var User = proxyquire('../../server/objects/user', {'../objects/itra': stubItra});
                var user = new User();
                user.getItraCode(1, function (err, code) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not get itra code of user!');
                    }
                });
            });
        });
        describe('Test getRuns', function () {
            it('Should get runs from itra website for a users which fail', function (done) {
                var stubItra = function itra() {};
                stubItra.prototype.getCode = function (callback) { return callback('Mock to fail'); };
                stubItra.prototype.getRuns = function (callback) { return callback('Mock to fail'); };
                var User = proxyquire('../../server/objects/user', {'../objects/itra': stubItra});
                var user = new User();
                user.getRuns(1, function (err, code) {
                    if (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    } else {
                        return done('Should not get itra runs of user!');
                    }
                });
            });
        });
    });
});