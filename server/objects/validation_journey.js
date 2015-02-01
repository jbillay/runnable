/**
 * Created by jeremy on 31/01/15.
 */

var models = require('../models');

function validationJourney() {
    'use strict';
    this.joinId = null;
    this.userId = null;
    this.comment_driver = null;
    this.comment_service = null;
    this.rates = null;
    this.createdAt = null;
    this.updatedAt = null;
}

validationJourney.prototype.get = function () {
    'use strict';
    return this;
};

validationJourney.prototype.set = function (validation) {
    'use strict';
    if (validation.joinId) {
        this.joinId = validation.joinId;
    }
    if (validation.userId) {
        this.userId = validation.userId;
    }
    if (validation.comment_driver) {
        this.comment_driver = validation.comment_driver;
    }
    if (validation.comment_service) {
        this.comment_service = validation.comment_service;
    }
    if (validation.rates) {
        this.rates = validation.rates;
    }
    if (validation.updatedAt) {
        this.updatedAt = validation.updatedAt;
    }
    if (validation.createdAt) {
        this.createdAt = validation.createdAt;
    }
};

validationJourney.prototype.create = function (done) {
    'use strict';
    var that = this;
    console.log('Validation of a journey by user :' + that.userId);
    models.User.find({where: {id: that.userId}})
        .then(function(user) {
            models.Join.find({where: {id: that.joinId}})
                .then(function (join) {
                    models.ValidationJourney.create(that)
                        .then(function (valide) {
                            valide.setUser(user)
                                .then(function (validate) {
                                    validate.setJoin(join)
                                        .then(function (validate) {
                                            done(null, validate);
                                        })
                                        .catch (function (err) {
                                            done(err, null);
                                        });
                                });
                        });
                });
        });

};

module.exports = validationJourney;
