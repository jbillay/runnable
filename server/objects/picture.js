/**
 * Created by jeremy on 26/01/2016.
 */

'use strict';

var models = require('../models');
var q = require('q');
var cloudinary = require('cloudinary');
var fs = require('fs');
var settings    = require('../../conf/config');

function picture() {
    this.id = null;
    this.link = null;
    this.default = 0;
    this.createdAt = null;
    this.updatedAt = null;
}

picture.prototype.get = function () {
    return this;
};

picture.prototype.set = function (picture) {
    if (picture.id)
        this.id = picture.id;
    if (picture.link)
        this.link = picture.link;
    if (picture.default)
        this.default = picture.default;
    if (picture.createdAt)
        this.createdAt = picture.createdAt;
    if (picture.updatedAt)
        this.updatedAt = picture.updatedAt;
};

picture.prototype.create = function (filePath, isDefault, runId) {
    var deferred = q.defer();

    cloudinary.config({
        cloud_name: settings.cloudinary.cloud_name,
        api_key: settings.cloudinary.api_key,
        api_secret: settings.cloudinary.api_secret
    });
    models.Run.find({where: {id: runId}})
        .then(function (run) {
            models.Picture.create(this)
                .then(function (picture) {
                    picture.setRun(run)
                        .then(function (picture) {
                            var fileName = 'Run_' + run.id + '_Picture_' + picture.id + '_' + process.env.NODE_ENV;
                            cloudinary.uploader.upload(filePath,
                                function(result) {
                                    fs.unlink(filePath, function (err) { if (err) console.log(new Error(err)); });
                                    picture.link = result.url;
                                    picture.default = isDefault;
                                    picture.save()
                                        .then(function (picture) {
                                            deferred.resolve(picture);
                                        })
                                        .catch(function (err) {
                                            deferred.reject(new Error(err));
                                        });
                                },
                                {public_id: fileName}
                            );
                        })
                        .catch(function (err) {
                            deferred.reject(new Error(err));
                        });
                })
                .catch(function (err) {
                    deferred.reject(new Error(err));
                });
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

picture.prototype.remove = function (id) {
    var deferred = q.defer();
    models.Picture.find({where: {id: id}})
        .then(function (picture) {
            var fileName = 'Run_' + picture.RunId + '_Picture_' + id + '_' + process.env.NODE_ENV;
            cloudinary.uploader.destroy(fileName,
                function(result) {
                    deferred.resolve(result);
                });
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

picture.prototype.setDefault = function (name, runId) {
    var deferred = q.defer();
    models.Picture.find({where: {name: name, RunId: runId}})
        .then(function (picture) {
            if (picture) {
                deferred.reject(new Error('Picture not found'));
            } else {
                picture.default = true;
                picture.save()
                    .then(function (picture) {
                        deferred.resolve(picture);
                    })
                    .catch(function (err) {
                        deferred.reject(new Error(err));
                    });
            }
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

picture.prototype.getList = function (runId) {
    var deferred = q.defer();
    models.Picture.findAll({where: {RunId: runId}})
        .then(function(pictures) {
            deferred.resolve(pictures);
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

picture.prototype.get = function (id) {
    var deferred = q.defer();
    models.Picture.find({where: {id: id}})
        .then(function (picture) {
            deferred.resolve(picture);
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

module.exports = picture;