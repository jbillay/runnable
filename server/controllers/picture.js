/**
 * Created by jeremy on 06/02/2016.
 */

var Picture = require('../objects/picture');

exports.get = function (req, res) {
    'use strict';
    var picture = new Picture(),
        pictureId = req.params.id;
    picture.get(pictureId)
        .then(function (picture) {
            return res.jsonp({msg: picture, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.getList = function (req, res) {
    'use strict';
    var picture = new Picture(),
        runId = req.params.runId;
    picture.getList(runId)
        .then(function (pictures) {
            return res.jsonp({msg: pictures, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.setDefault = function (req, res) {
    'use strict';
    var picture = new Picture(),
        pictureId = req.params.id,
        runId = req.params.runId;
    picture.setDefault(pictureId, runId)
        .then(function (pictures) {
            return res.jsonp({msg: pictures, type: 'success'});
        })
        .catch(function (err) {
            return res.jsonp({msg: err, type: 'error'});
        });
};

exports.remove = function (req, res) {
    'use strict';
    var picture = new Picture(),
        pictureId = req.params.id;
    picture.remove(pictureId)
        .then(function (picture) {
            if (picture.result === 'ok') {
                return res.jsonp({msg: picture, type: 'success'});
            } else {
                return res.jsonp({msg: picture, type: 'error'});
            }
        })
        .catch(function (err) {
            console.log(err);
            return res.jsonp({msg: 'runPictureNotRemove', type: 'error'});
        });
};

exports.add = function (req, res) {
    'use strict';
    if (req.files.file) {
        var picture = new Picture(),
            runId = req.params.runId,
            path = req.files.file[0].path;
        picture.create(path, runId)
            .then(function (picture) {
                return res.jsonp({msg: picture, type: 'success'});
            })
            .catch(function (err) {
                console.log(new Error('Not able to save run picture : ' + err));
                return res.jsonp({msg: 'runPictureNotSaved', type: 'error'});
            });
    } else {
        console.log(new Error('Not able to save profil picture : as no file in req.files !'));
        return res.jsonp({msg: 'runPictureNotSaved', type: 'error'});
    }
};
