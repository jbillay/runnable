/**
 * Created by jeremy on 21/02/15.
 */

var models = require('../models');
var Inbox = require('./inbox');

function invoice() {
    'use strict';
    this.id = null;
    this.journey = null;
    this.join = null;
    this.status = null;
    this.amount = null;
    this.fees = null;
    this.ref = null;
    this.transaction = null;
    this.driver_payed = false;
    this.user = null;
    this.journey_id = null;
    this.join_id = null;
}

invoice.prototype.get = function () {
    'use strict';
    return this;
};

invoice.prototype.set = function (invoice) {
    'use strict';
    if (invoice.id) {
        this.id = invoice.id; }
    if (invoice.status) {
        this.status = invoice.status; }
    if (invoice.amount) {
        this.amount = parseFloat(invoice.amount).toFixed(2); }
    if (invoice.fees) {
        this.fees = parseFloat(invoice.fees).toFixed(2); }
    if (invoice.transaction) {
        this.transaction = invoice.transaction; }
    if (invoice.ref) {
        this.ref = invoice.ref; }
    if (invoice.driver_payed) {
        this.driver_payed = invoice.driver_payed; }
    if (invoice.journey_id) {
        this.journey_id = invoice.journey_id; }
    if (invoice.join_id) {
        this.join_id = invoice.join_id; }
};

invoice.prototype.setUser = function (user) {
    'use strict';
    this.user = user;
};

invoice.prototype.setJourney = function (journey) {
    'use strict';
    this.journey = journey;
};

invoice.prototype.setJoin = function (join) {
    'use strict';
    this.join = join;
};

invoice.prototype.save = function (invoice, user, done) {
    'use strict';
    var that = this,
        inbox = new Inbox();

    this.set(invoice);
    console.log('try to create an invoice for join : ' + that.join_id);
    models.User.find({where: {id: user.id}})
        .then(function (user) {
            models.Journey.find({where: {id: that.journey_id}, include: [models.Run]})
                .then(function (journey) {
                    models.Join.find({where: {id: that.join_id}})
                        .then(function (join) {
                            models.Invoice.create(that)
                                .then(function(newInvoice) {
                                    newInvoice.setJourney(journey)
                                        .then(function () {
                                            newInvoice.setJoin(join)
                                                .then(function () {
                                                    newInvoice.setUser(user)
                                                        .then(function(newInvoice) {
                                                            var template = 'JourneySubmit',
                                                                values = { runName: journey.Run.name };
                                                            inbox.add(template, values, user.id)
                                                                .then(function (msg) {
                                                                    done(null, newInvoice);
                                                                })
                                                                .catch(function (err) {
                                                                    done(new Error(err), null);
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            done(new Error(err), null);
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });
};

invoice.prototype.getById = function (id, done) {
    'use strict';
    models.Invoice.find({ where: {id: id}})
        .then(function (invoice) {
            done(null, invoice);
        })
        .catch(function (err) {
            done(err, null);
        });
};

invoice.prototype.getByUser = function (id, done) {
    'use strict';
    models.Invoice.findAll({where: {userId: id, status: 'completed'},
        include: [models.Join, {
            model: models.Journey,
            as: 'Journey',
            include: [ models.Run ]
        }]})
        .then(function (invoices) {
            done(null, invoices);
        })
        .catch(function (err) {
            done(err, null);
        });
};

invoice.prototype.getByDriver = function (id, done) {
    'use strict';
    models.Journey.findAll({where: {userId: id, is_canceled: false}})
        .then(function (journeys) {
            var journeyIdList = [];
            journeys.forEach(function (journey) {
                journeyIdList.push(journey.id);
            });
            models.Invoice.findAll({where: {journeyId: journeyIdList, status: 'completed'},
                include: [models.Join, {
                    model: models.Journey,
                    as: 'Journey',
                    include: [ models.Run ]
                }]})
                .then(function (invoices) {
                    done(null, invoices);
                })
                .catch(function (err) {
                    done(err, null);
                });
        })
        .catch(function (err) {
            done(err, null);
        });
};

invoice.prototype.updateStatus = function (id, status, done) {
    'use strict';
    console.log('Update status of invoice ' + id + ' to ' + status);
    models.Invoice.find({where: {id: id}})
        .then(function (invoiceData) {
            invoiceData.status = status;
            invoiceData.save()
                .then(function (newInvoice) {
                    done(null, newInvoice);
                })
                .catch(function (err) {
                    done(new Error(err), null);
                });
        })
        .catch(function(err) {
            done(err, null);
        });
};

invoice.prototype.updatePaymentStatus = function (invoiceRef, amount, status, transactionId, done) {
    'use strict';
    console.log('Update invoice ' + invoiceRef + ' to status ' + status);
    models.Invoice.find({ where: {ref: invoiceRef}, include: [{
                            model: models.Journey,
                            as: 'Journey',
                            include: [models.Run]
                        }]})
        .then(function (invoice) {
            if (invoice.amount === amount) {
                invoice.status = status;
                invoice.transaction = transactionId;
                invoice.save()
                    .then(function (newInvoice) {
                        done(null, newInvoice);
                    })
                    .catch(function (err) {
                        done(new Error(err), null);
                    });
            } else {
                done(new Error('Amount is different then initial'), null);
            }
        })
        .catch(function (err) {
            done(err, null);
        });
};

module.exports = invoice;
