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
    this.rate_driver = null;
    this.rate_service = null;
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
    if (validation.rate_driver) {
        this.rate_driver = validation.rate_driver;
    }
    if (validation.rate_service) {
        this.rate_service = validation.rate_service;
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
					if (!join) {
						done(new Error('Join not found'), null);
					}
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

validationJourney.prototype.getUserFeedback = function (done) {
    'use strict';
    // TODO: where rate_service >= 3 and limit to 3
    models.ValidationJourney.findAll()
        .then(function (feedbacks) {
            done(null, feedbacks);
        })
        .catch(function (err) {
            done(err, null);
        });
};

module.exports = validationJourney;
