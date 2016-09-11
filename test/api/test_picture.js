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
var proxyquire = require('proxyquire');

describe('Test of picture object', function () {
    before(function (done) {
        this.timeout(6000);
        models.loadFixture(done);
    });
    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of picture over !');
    });

    describe('Test with local database', function () {
        it('Create and get picture object', function (done) {
            var picture = new Picture(),
                newPicture = {
                    id: 4,
                    link: 'http://res.cloudinary.com/myruntrip/image/upload/v1456596630/Run_72_Picture_2_test.jpg',
                    default: true,
                    createdAt: '2016-02-23 00:00:00',
                    updatedAt: '2016-02-23 00:00:00'
                };

            picture.set({});
            picture.set(newPicture);
            var retrievePicture = picture.get();
            assert.equal(retrievePicture.id, 4);
            assert.equal(retrievePicture.link, 'http://res.cloudinary.com/myruntrip/image/upload/v1456596630/Run_72_Picture_2_test.jpg');
            assert.isTrue(retrievePicture.default);
            assert.equal(retrievePicture.createdAt, '2016-02-23 00:00:00');
            assert.equal(retrievePicture.updatedAt, '2016-02-23 00:00:00');
            return done();
        });
        // TODO: move that test to integration testing
        it.skip('Create new image as default for the run 1', function (done) {
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
                            assert.equal(pictures.length, 2);
                            assert.equal(pictures[0].default, false);
                            assert.equal(pictures[1].default, true);
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
                    assert.equal(pictures.length, 2);
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

        // TODO: move that test to integration testing
        it.skip('Get image id 4', function (done) {
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

        // TODO: move that test to integration testing
        it.skip('Remove image with id 4', function (done) {
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
    describe('Test with mock', function () {
        describe('Test create', function () {
            it('Should create a picture which fail to get run', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); },
                        destroy: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); }
                    }
                };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary});
                var picture = new Picture();
                picture.create('kqjsdljqslkdjl', 1)
                    .then(function () {
                        return done('Should not create picture !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should create a picture which fail to create picture', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Picture: { create: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); },
                        destroy: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); }
                    }
                };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary});
                var picture = new Picture();
                picture.create('kqjsdljqslkdjl', 1)
                    .then(function () {
                        return done('Should not create picture !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should create a picture which fail to associate run', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Picture: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                                        id: 1,
                                        setRun: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                                    }); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); },
                        destroy: function (file, callback) { return callback({result: {error: 'Mock to fail'}}); }
                    }
                };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary});
                var picture = new Picture();
                picture.create('kqjsdljqslkdjl', 1)
                    .then(function () {
                        return done('Should not create picture !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should create a picture but with a warning on file upload to cloudinary', function (done) {
                var spyConsole = sinon.spy(console, 'error');
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Picture: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                                        id: 1,
                                        setRun: function (params) { var deferred = q.defer(); deferred.resolve({
                                            id: 7,
                                            save: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; }
                                        }); return deferred.promise; }
                                    }); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({error: 'Mock to fail'}); },
                        destroy: function (file, callback) { return callback({error: 'Mock to fail'}); }
                    }
                };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary});
                var picture = new Picture();
                picture.create('kqjsdljqslkdjl', 1)
                    .then(function () {
                        console.error.restore();
                        assert.equal(spyConsole.callCount, 1);
                        assert.include(spyConsole.firstCall.args[0].toString(), 'ERROR TO UPLOAD IMG');
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
            it('Should create a picture but with a warning unlink not possible', function (done) {
                var spyConsole = sinon.spy(console, 'log');
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                                    Picture: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                                        id: 1,
                                        setRun: function (params) { var deferred = q.defer(); deferred.resolve({
                                            id: 7,
                                            save: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; }
                                        }); return deferred.promise; }
                                    }); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback('Mock to fail'); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.create('kqjsdljqslkdjl', 1)
                    .then(function () {
                        console.log.restore();
                        assert.equal(spyConsole.callCount, 1);
                        assert.include(spyConsole.firstCall.args[0].toString(), 'Error: Mock to fail');
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
            it('Should create a picture which fail to save picture', function (done) {
                var stubModel = { Run: { find: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Picture: { create: function (params) { var deferred = q.defer(); deferred.resolve({
                        id: 1,
                        setRun: function (params) { var deferred = q.defer(); deferred.resolve({
                            id: 7,
                            save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                        }); return deferred.promise; }
                    }); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.create('kqjsdljqslkdjl', 1)
                    .then(function () {
                        return done('Should not create picture !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test remove', function () {
            it('Should remove a picture which fail to destroy picture', function (done) {
                var stubModel = { Picture: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    id: 1,
                    RunId: 3,
                    destroy: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.remove(1)
                    .then(function () {
                        return done('Should not remove picture !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test removeForRun', function () {
            it('Should remove a picture for a run which fail to find all pictures', function (done) {
                var stubModel = { Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.removeForRun(1)
                    .then(function () {
                        return done('Should not remove pictures !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should remove a picture for a run which fail as no picture to remove', function (done) {
                var stubModel = { Picture: { findAll: function (params) { var deferred = q.defer(); deferred.resolve([]); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.removeForRun(1)
                    .then(function (res) {
                        assert.isTrue(res);
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
        });
        describe('Test setDefault', function () {
            it('Should set a picture as default for a run which fail to find all pictures', function (done) {
                var stubModel = { Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.setDefault(1, 2)
                    .then(function () {
                        return done('Should not remove pictures !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should set a picture as default for a run which fail as no picture found', function (done) {
                var stubModel = { Picture: { findAll: function (params) { var deferred = q.defer(); deferred.resolve(null); return deferred.promise; },
                                                update: function (params) { var deferred = q.defer(); deferred.resolve([]); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.setDefault(1, 2)
                    .then(function () {
                        return done('Should not remove pictures !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: No pictures found for run 2');
                        return done();
                    });
            });
            it('Should set a picture as default for a run which fail to find the picture', function (done) {
                var stubModel = { Picture: {    findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; },
                                                update: function (params) { var deferred = q.defer(); deferred.resolve([]); return deferred.promise; },
                                                find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.setDefault(1, 2)
                    .then(function () {
                        return done('Should not remove pictures !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should set a picture as default for a run which fail to save the picture', function (done) {
                var stubModel = { Picture: {    findAll: function (params) { var deferred = q.defer(); deferred.resolve([{id: 1}, {id: 2}]); return deferred.promise; },
                                                update: function (params) { var deferred = q.defer(); deferred.resolve([]); return deferred.promise; },
                                                find: function (params) { var deferred = q.defer(); deferred.resolve({
                                                    id: 1,
                                                    save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                                                }); return deferred.promise; } } };
                var stubClouddinary = {
                    config: function (option) { return true; },
                    uploader: {
                        upload: function (file, callback) { return callback({}); },
                        destroy: function (file, callback) { return callback({}); }
                    }
                };
                var stubFs = { unlink: function (filepath, callback) { return callback(); } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel, 'cloudinary': stubClouddinary, 'fs': stubFs});
                var picture = new Picture();
                picture.setDefault(1, 2)
                    .then(function () {
                        return done('Should not remove pictures !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test getList', function () {
            it('Should get list of picture for  a run which fail', function (done) {
                var stubModel = { Picture: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel});
                var picture = new Picture();
                picture.getList(1)
                    .then(function () {
                        return done('Should not get pictures !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test retrieve', function () {
            it('Should retrieve a picture which fail', function (done) {
                var stubModel = { Picture: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Picture = proxyquire('../../server/objects/picture', {'../models': stubModel});
                var picture = new Picture();
                picture.retrieve(1)
                    .then(function () {
                        return done('Should not get the picture !');
                    })
                    .catch(function (err) {
                        assert.include(err.toString(), 'Error: Mock to fail');
                        return done();
                    });
            });
        });
    });
});