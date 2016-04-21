/**
 * Created by jeremy on 11/04/2016.
 */

'use strict';

var models = require('../models');
var q = require('q');

function fee() {
    this.id = null;
    this.code = null;
    this.percentage = null;
    this.value = null;
    this.discount = null;
    this.default = false;
    this.remaining = null;
    this.start_date = null;
    this.end_date = null;
    this.createdAt = null;
    this.updatedAt = null;
    this.RunId = null;
    this.UserId = null;
}

fee.prototype.get = function () {
    return this;
};

fee.prototype.set = function (fee) {
    if (fee.id)
        this.id = fee.id;
    if (fee.code)
        this.code = fee.code;
    if (fee.percentage)
        this.percentage = fee.percentage;
    else
        this.percentage = null;
    if (fee.value)
        this.value = fee.value;
    else
        this.value = null;
    if (fee.discount)
        this.discount = fee.discount;
    else
        this.discount = null;
    if (fee.default)
        this.default = fee.default;
    else
        this.default = false;
    if (fee.remaining)
        this.remaining = fee.remaining;
    if (fee.start_date)
        this.start_date = fee.start_date;
    else
        this.start_date = new Date();
    if (fee.end_date)
        this.end_date = fee.end_date;
    else
        this.end_date = null;
    if (fee.createdAt)
        this.createdAt = fee.createdAt;
    if (fee.updatedAt)
        this.updatedAt = fee.updatedAt;
    if (fee.RunId)
        this.RunId = fee.RunId;
    if (fee.UserId)
        this.UserId = fee.UserId;
};

fee.prototype.getDefault = function () {
    var deferred = q.defer(),
        limitDate = new Date();
    models.Fee.find({where: {default: true, code: {$eq: null}, start_date: {$lt: limitDate},
        $or: [{end_date: {$gt: limitDate}}, {end_date: {$eq: null}}]
    }})
        .then(function(fees) {
            deferred.resolve(fees);
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

fee.prototype.getAggregatedFees = function (fees, defaultFee) {
    var fee = {
        percentage: null,
        value: null,
        discount: null
    };
    fees.forEach(function (currentFee) {
        if (fee.percentage === null || (currentFee.percentage < fee.percentage && currentFee.percentage !== null)) {
            fee.percentage = currentFee.percentage;
        }
        if (fee.value === null || (currentFee.value < fee.value && currentFee.value !== null)) {
            fee.value = currentFee.value;
        }
        if (fee.discount === null || currentFee.discount > fee.discount) {
            fee.discount = currentFee.discount;
        }
    });
    if (fee.percentage === null) {
        fee.percentage = defaultFee.percentage;
    }
    if (fee.value === null) {
        fee.value = defaultFee.value;
    }
    return fee;
};

fee.prototype.filterNotOwnedFees = function (userId, runId, fees) {
    var filtered = [];

    fees.forEach(function (fee) {
        if (fee.UserId === userId || fee.UserId === null) {
            if (fee.RunId === runId || fee.RunId === null) {
                filtered.push(fee);
            }
        }
    });
    return filtered;
};

fee.prototype.getForUser = function (userId, runId) {
    var deferred = q.defer(),
        self = this,
        limitDate = new Date();
    self.getDefault()
        .then(function (defaultFees) {
            models.Fee.findAll({where: {
                    start_date: {$lt: limitDate},
                    code: {$eq: null},
                    $and: [
                        {$or: [{end_date: {$gt: limitDate}}, {end_date: {$eq: null}}]},
                        {$or: [{remaining: {$gt: 0}}, {remaining: {$eq: null}}]},
                        {$or: [{UserId: userId}, {RunId: runId}]}
                    ]
                }})
                .then(function(fees) {
                    var filteredFees = self.filterNotOwnedFees(userId, runId, fees);
                    deferred.resolve(self.getAggregatedFees(filteredFees, defaultFees));
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

fee.prototype.getList = function () {
    var deferred = q.defer(),
        limitDate = new Date();
    models.Fee.findAll({where: {start_date: {$lt: limitDate}, default: false,
            $and: [
                {$or: [{end_date: {$gt: limitDate}}, {end_date: {$eq: null}}]},
                {$or: [{remaining: {$gt: 0}}, {remaining: {$eq: null}}]}
            ]}})
        .then(function(fees) {
            deferred.resolve(fees);
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

fee.prototype.remove = function (id) {
    var deferred = q.defer();

    models.Fee.find({where: {id: id}})
        .then(function (fee) {
            fee.update({end_date: new Date()})
                .then(function (res) {
                    deferred.resolve(res);
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

fee.prototype.attachUser = function (fee, userId) {
    var deferred = q.defer();

    models.User.find({where: {id: userId}})
        .then(function (user) {
            fee.setUser(user)
                .then(function (fee) {
                    deferred.resolve(fee);
                })
                .catch(function (err) {
                    deferred.resolve(new Error(err));
                });
        })
        .catch(function (err) {
            deferred.resolve(new Error(err));
        });
    return deferred.promise;
};

fee.prototype.attachRun = function (fee, runId) {
    var deferred = q.defer();

    models.Run.find({where: {id: runId}})
        .then(function (run) {
            fee.setRun(run)
                .then(function (fee) {
                    deferred.resolve(fee);
                })
                .catch(function (err) {
                    deferred.resolve(new Error(err));
                });
        })
        .catch(function (err) {
            deferred.resolve(new Error(err));
        });
    return deferred.promise;
};

fee.prototype.add = function (code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId) {
    var deferred = q.defer(),
        self = this,
        newFee = {
            code: code,
            percentage: percentage,
            value: value,
            discount: discount,
            default: isDefault,
            remaining: remaining,
            start_date: startDate,
            end_date: endDate
        };
    this.set(newFee);
    models.Fee.create(this)
        .then(function(newFee) {
            if (userId) {
                self.attachUser(newFee, userId)
                    .then(function (newFee) {
                        if (runId) {
                            self.attachRun(newFee, runId)
                                .then(function (fee) {
                                    deferred.resolve(fee);
                                })
                                .catch(function (err) {
                                    deferred.reject(new Error(err));
                                });
                        } else {
                            deferred.resolve(newFee);
                        }
                    })
                    .catch(function (err) {
                        deferred.resolve(new Error(err));
                    });
            } else if (runId) {
                self.attachRun(newFee, runId)
                    .then(function (fee) {
                        deferred.resolve(fee);
                    })
                    .catch(function (err) {
                        deferred.reject(new Error(err));
                    });
            } else {
                deferred.resolve(newFee);
            }
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

fee.prototype.update = function (id, code, percentage, value, discount, isDefault, remaining, startDate, endDate, userId, runId) {
    var deferred = q.defer(),
        self = this,
        newFee = {
            id: id,
            code: code,
            percentage: percentage,
            value: value,
            discount: discount,
            default: isDefault,
            remaining: remaining,
            start_date: startDate,
            end_date: endDate
        };
    self.set(newFee);
    models.Fee.find({where: {id: id}})
        .then(function (fee) {
            if (fee) {
            fee.update({end_date: new Date()})
                .then(function (fee) {
                    self.id = null;
                    if (startDate === null) {
                        self.start_date = new Date();
                    }
                    models.Fee.create(self)
                        .then(function (fee) {
                            if (userId && fee.UserId !== userId) {
                                self.attachUser(fee, userId)
                                    .then(function (newFee) {
                                        if (newFee.RunId !== runId) {
                                            self.attachRun(newFee, runId)
                                                .then(function (fee) {
                                                    deferred.resolve(fee);
                                                })
                                                .catch(function (err) {
                                                    deferred.reject(new Error(err));
                                                });
                                        } else {
                                            deferred.resolve(newFee);
                                        }
                                    })
                                    .catch(function (err) {
                                        deferred.resolve(new Error(err));
                                    });
                            } else if (fee.RunId !== runId) {
                                self.attachRun(fee, runId)
                                    .then(function (fee) {
                                        deferred.resolve(fee);
                                    })
                                    .catch(function (err) {
                                        deferred.reject(new Error(err));
                                    });
                            } else {
                                deferred.resolve(fee);
                            }
                        })
                        .catch(function (err) {
                            deferred.reject(new Error(err));
                        });
                })
                .catch(function (err) {
                    deferred.reject(new Error(err));
                });
            } else {
                deferred.reject(new Error('Fee version not found'));
            }
        })
        .catch(function (err) {
            deferred.reject(new Error(err));
        });
    return deferred.promise;
};

fee.prototype.checkCode = function (code) {
    var deferred = q.defer(),
        limitDate = new Date();

    models.Fee.find({where: {
            code: code,
            start_date: {$lt: limitDate},
            $and: [
                {$or: [{end_date: {$gt: limitDate}}, {end_date: {$eq: null}}]},
                {$or: [{remaining: {$gt: 0}}, {remaining: {$eq: null}}]}
            ]
        }})
            .then(function (fee) {
                var newFee = {
                    id: null,
                    discount: null
                };
                if (fee && fee.discount && fee.id) {
                    newFee.discount = fee.discount;
                    newFee.id = fee.id;
                }
                deferred.resolve(newFee);
            })
            .catch(function (err) {
                deferred.reject(new Error(err));
            });
    return deferred.promise;
};

fee.prototype.useCode = function (id) {
    var deferred = q.defer();

    models.Fee.find({where: {id: id}})
            .then(function (usedFee) {
                if (usedFee.remaining > 0) {
                    usedFee.update({remaining: usedFee.remaining - 1})
                        .then(function (newFee) {
                            deferred.resolve(newFee);
                        })
                        .catch(function (err) {
                            deferred.reject(new Error(err));
                        });
                } else {
                    deferred.resolve(null);
                }
            })
            .catch(function (err) {
                deferred.reject(new Error(err));
            });

    return deferred.promise;
};

module.exports = fee;