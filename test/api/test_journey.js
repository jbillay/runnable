/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';
process.env.REDIS_URL = 6379;

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Journey = require('../../server/objects/journey');
var Join = require('../../server/objects/join');
var Inbox = require('../../server/objects/inbox');
var sinon = require('sinon');
var settings = require('../../conf/config');
var proxyquire = require('proxyquire');
var q = require('q');

describe('Test of journey object', function () {
    beforeEach(function (done) {
        process.env.NODE_ENV = 'test';
        this.timeout(settings.timeout);
        var fakeTime = new Date(2015, 6, 6, 0, 0, 0, 0).getTime();
        sinon.clock = sinon.useFakeTimers(fakeTime, 'Date');
        models.loadFixture(done);
    });

    afterEach(function() {
        // runs after each test in this block
        sinon.clock.restore();
    });

    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of journey over !');
    });

    describe('Test with local database', function () {
        it('Get user journeys list', function (done) {
            var journey = new Journey();
            journey.getByUser(1, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 3);
                assert.equal(journeyList[1].id, 2);
                assert.equal(journeyList[1].address_start, 'Nantes, France');
                assert.equal(journeyList[1].car_type, 'citadine');
                assert.equal(journeyList[1].amount, 32);
                assert.equal(journeyList[1].User.email, 'jbillay@gmail.com');
                assert.equal(journeyList[1].Run.name, 'Les templiers');
                journey.getByUser(-1, function (err, journeyList) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });

        it('Get filtered Journey already full with and without limit', function (done) {
            var journey = new Journey();
            models.Journey.findAll({where: {is_canceled: false}, include: [
                    {
                        model: models.Join,
                        as: 'Joins',
                        include: [ models.Invoice ]
                    },
                    { model: models.Run }
                ]})
                .then(function (journeyList) {
                    var filteredJourney = journey.filterFullJourney(journeyList, 0);
                    assert.equal(filteredJourney.length, 2);
                    filteredJourney = journey.filterFullJourney(journeyList, 1);
                    assert.equal(filteredJourney.length, 1);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Get filtered past Journey', function (done) {
            var journey = new Journey();
            models.Journey.findAll({where: {is_canceled: false}, include: [
                    {
                        model: models.Join,
                        as: 'Joins',
                        include: [ models.Invoice ]
                    },
                    { model: models.Run }
                ]})
                .then(function (journeyList) {
                    var filteredJourney = journey.filterPastJourney(journeyList);
                    assert.equal(filteredJourney.length, 3);
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Get free space for a journey', function (done) {
            var journey = new Journey();
            journey.getBookSpace(1, function (err, spaces) {
                if (err) return done(err);
                assert.equal(spaces.outward, 2);
                assert.equal(spaces.return, 2);
                journey.getBookSpace(2, function (err, spaces) {
                    if (err) return done(err);
                    assert.equal(spaces.outward, 2);
                    assert.equal(spaces.return, 0);
                    journey.getBookSpace(3, function (err, spaces) {
                        if (err) return done(err);
                        assert.equal(spaces.outward, 0);
                        assert.equal(spaces.return, 0);
                        return done();
                    });
                });
            });
        });

        it('Get journey info', function (done) {
            var journey = new Journey();
            journey.getById(3, function (err, journeyInfo) {
                if (err) return done(err);
                assert.equal(journeyInfo.id, 3);
                assert.equal(journeyInfo.address_start, 'Rouen');
                assert.equal(journeyInfo.car_type, 'citadine');
                assert.equal(journeyInfo.amount, 12);
                assert.equal(journeyInfo.distance, '250 km');
                assert.equal(journeyInfo.duration, '2 heures 45 minutes');
                assert.equal(journeyInfo.journey_type, 'aller-retour');
                assert.equal(journeyInfo.time_start_outward, '09:00');
                assert.equal(journeyInfo.nb_space_outward, 2);
                assert.equal(journeyInfo.time_start_return, '09:00');
                assert.equal(journeyInfo.nb_space_return, 2);
                assert.equal(journeyInfo.RunId, 4);
                journey.getById(-1, function (err, journeyInfo) {
                    assert.isNotNull(err);
                    return done();
                });
            });
        });

        it('Get next journeys list', function (done) {
            var journey = new Journey();
            journey.getNextList(3, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 2);
                assert.equal(journeyList[0].Run.name, 'Marathon du médoc');
                journey.getNextList(2, function (err, journeyList) {
                    if (err) return done(err);
                    assert.equal(journeyList.length, 2);
                    assert.equal(journeyList[1].Run.name, 'Corrida de Saint Germain en Laye');
                    journey.getNextList('dmkme', function (err, journeyList) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });

        it('Get list of journey for a run', function (done) {
            var journey = new Journey();
            journey.getListForRun(4, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 1);
                assert.equal(journeyList[0].Joins.length, 2);
                assert.equal(journeyList[0].Run.name, 'Corrida de Saint Germain en Laye');
                journey.getListForRun(2, function (err, journeyList) {
                    if (err) return done(err);
                    assert.equal(journeyList.length, 0);
                    journey.getListForRun('dmkme', function (err, journeyList) {
                        assert.isNotNull(err);
                        return done();
                    });
                });
            });
        });

        it('Get list of journey', function (done) {
            var journey = new Journey();
            journey.getList(0, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 4);
                assert.equal(journeyList[1].Run.name, 'Les templiers');
                return done();
            });
        });

        it('Get list of journey with old one', function (done) {
            var journey = new Journey();
            journey.getList(1, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 5);
                assert.equal(journeyList[1].Run.name, 'Les templiers');
                return done();
            });
        });

        it('Get list of open journey', function (done) {
            var journey = new Journey();
            journey.getOpenList(function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 2);
                assert.equal(journeyList[1].Run.name, 'Corrida de Saint Germain en Laye');
                return done();
            });
        });

        describe('Creation of Journey', function () {
            it('Create a new journey', function (done) {
                var journey = new Journey(),
                    inbox = new Inbox(),
                    newJourney = {
                        address_start: 'Paris',
                        distance: '25 km',
                        duration: '20 minutes',
                        journey_type: 'aller-retour',
                        date_start_outward: '2016-12-12 00:00:00',
                        time_start_outward: '09:00',
                        nb_space_outward: 2,
                        date_start_return: '2016-12-13 00:00:00',
                        time_start_return: '09:00',
                        nb_space_return: 2,
                        car_type: 'citadine',
                        amount: 5,
                        UserId: 1,
                        Run: {
                            id: 4
                        }
                    },
                    user = {
                        'id': 1
                    };
                journey.setJourney({});
                journey.setJourney(newJourney);
                var tmp = journey.get();
                assert.equal(tmp.distance, '25 km');
                assert.equal(tmp.journey_type, 'aller-retour');
                assert.equal(tmp.car_type, 'citadine');
                assert.equal(tmp.amount, 5);
                journey.save(tmp, user.id, 'admin', function(err, newJourney) {
                    if (err) return done(err);
                    assert.equal(newJourney.id, 6);
                    assert.equal(newJourney.distance, '25 km');
                    assert.equal(newJourney.journey_type, 'aller-retour');
                    assert.equal(newJourney.car_type, 'citadine');
                    assert.equal(newJourney.amount, 5);
                    assert.isUndefined(newJourney.PartnerId);
                    journey.getList(1, function (err, journeyList) {
                        if (err) return done(err);
                        assert.equal(journeyList.length, 6);
                        inbox.getList(user, function (err, messages) {
                            if (err) return done(err);
                            assert.equal(messages.length, 3);
                            assert.include(messages[0].message, 'Created Corrida de Saint Germain en Laye');
                            assert.include(messages[0].title, 'Corrida de Saint Germain en Laye');
                            return done();
                        });
                    });
                });
            });

            it('Create a new journey for a partner', function (done) {
                var journey = new Journey(),
                    inbox = new Inbox(),
                    newJourney = {
                        address_start: 'Paris',
                        distance: '25 km',
                        duration: '20 minutes',
                        journey_type: 'aller-retour',
                        date_start_outward: '2016-12-12 00:00:00',
                        time_start_outward: '09:00',
                        nb_space_outward: 2,
                        date_start_return: '2016-12-13 00:00:00',
                        time_start_return: '09:00',
                        nb_space_return: 2,
                        car_type: 'citadine',
                        amount: 5,
                        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNDgsImV4cCI6MTIwNTA5NjA2NjF9.-vmI9gHnCFX30N2oVhQLiADX-Uz2XHzrHjWjJpvSERo',
                        UserId: 1,
                        Run: {
                            id: 4
                        }
                    },
                    user = {
                        'id': 1
                    };
                journey.save(newJourney, user.id, 'user', function(err, createdJourney) {
                    if (err) return done(err);
                    assert.equal(createdJourney.id, 6);
                    assert.equal(createdJourney.distance, '25 km');
                    assert.equal(createdJourney.journey_type, 'aller-retour');
                    assert.equal(createdJourney.car_type, 'citadine');
                    assert.equal(createdJourney.amount, 5);
                    assert.equal(createdJourney.PartnerId, 1);
                    journey.getList(1, function (err, journeyList) {
                        if (err) return done(err);
                        assert.equal(journeyList.length, 6);
                        inbox.getList(user, function (err, messages) {
                            if (err) return done(err);
                            assert.equal(messages.length, 3);
                            assert.include(messages[0].message, 'Created Corrida de Saint Germain en Laye');
                            assert.include(messages[0].title, 'Corrida de Saint Germain en Laye');
                            return done();
                        });
                    });
                });
            });

            it('Draft a new journey and save it', function (done) {
                var journey = new Journey(),
                    newJourney = {
                        address_start: 'Paris',
                        distance: '25 km',
                        duration: '20 minutes',
                        journey_type: 'aller-retour',
                        date_start_outward: '2016-12-12 00:00:00',
                        time_start_outward: '09:00',
                        nb_space_outward: 2,
                        date_start_return: '2016-12-13 00:00:00',
                        time_start_return: '09:00',
                        nb_space_return: 2,
                        car_type: 'citadine',
                        amount: 5,
                        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNjcsImV4cCI6MTIwNTA5NDE5NzR9.fikQ6L2eYUBujEeV-OYMFfX_pER5eC2Z_nQJ0YVyb9w',
                        UserId: 1,
                        Run: {
                            id: 4
                        }
                    },
                    user = {
                        'id': 1
                    };
                journey.draft(newJourney, function(err, journeyKey) {
                    if (err) return done(err);
                    // TODO: Mock journeyKey generated as redis id
                    // assert.equal(journeyKey, 'JNY425367');
                    journey.saveDraft(journeyKey, user.id, function (err, createdJourney) {
                        if (err) return done(err);
                        assert.equal(createdJourney.distance, '25 km');
                        assert.equal(createdJourney.journey_type, 'aller-retour');
                        assert.equal(createdJourney.car_type, 'citadine');
                        assert.equal(createdJourney.amount, 5);
                        assert.equal(createdJourney.PartnerId, 2);
                        journey.getList(1, function (err, journeyList) {
                            if (err) return done(err);
                            assert.equal(journeyList.length, 6);
                            return done();
                        });
                    });
                });
            });
        });

        it('Toggle payed status', function (done) {
            var journey = new Journey();
            journey.togglePayed(1, function (err, retJourney) {
                if (err) return done(err);
                assert.equal(retJourney.is_payed, true);
                journey.togglePayed(1, function (err, retJourney) {
                    if (err) return done(err);
                    assert.equal(retJourney.is_payed, false);
                    return done();
                });
            });
        });

        it('Cancel a journey', function (done) {
            var journey = new Journey(),
                join = new Join(),
                inbox = new Inbox();
            journey.getByUser(1, function (err, journeyList) {
                if (err) return done(err);
                assert.equal(journeyList.length, 3);
                journey.getById(2, function (err, journeyInfo) {
                    if (err) return done(err);
                    assert.equal(journeyInfo.is_canceled, false);
                    join.getByJourney(2, function (err, joinList) {
                        if (err) return done(err);
                        assert.equal(joinList.length, 2);
                        journey.cancel(2, function (err, journeyUpdated) {
                            if (err) return done(err);
                            assert.equal(journeyUpdated.is_canceled, true);
                            journey.getByUser(1, function (err, journeyList) {
                                if (err) return done(err);
                                assert.equal(journeyList.length, 2);
                                assert.equal(journeyList[0].Run.name, 'Marathon du médoc');
                                join.getByJourney(2, function (err, joinList) {
                                    if (err) return done(err);
                                    assert.equal(joinList.length, 0);
                                    var user2 = { id: 2 };
                                    inbox.getList(user2, function (err, messages) {
                                        if (err) return done(err);
                                        assert.equal(messages.length, 3);
                                        assert.include(messages[0].message, 'USER CANCEL Les templiers');
                                        assert.include(messages[0].title, 'Les templiers');
                                        var user = { id: journeyUpdated.UserId };
                                        inbox.getList(user, function (err, messages) {
                                            if (err) return done(err);
                                            assert.equal(messages.length, 3);
                                            assert.include(messages[0].message, 'Driver cancel journey Les templiers');
                                            assert.include(messages[0].title, 'Les templiers');
                                            return done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        describe('Update Journey', function () {
            // TODO: test has to be moved to integration testing
            it('Update an existing journey', function (done) {
                var journey = new Journey(),
                    inbox = new Inbox(),
                    updateJourney = {
                        id: 2,
                        lat: 48.856614,
                        lng: 2.3522219,
                        address_start: 'Paris, France',
                        distance: '654 km',
                        duration: '5 heures 14 minute',
                        journey_type: 'aller-retour',
                        date_start_outward: '2015-05-02 00:00:00',
                        time_start_outward: '09:00',
                        nb_space_outward: 1,
                        date_start_return: '2015-06-02 00:00:00',
                        time_start_return: '03:00',
                        nb_space_return: 5,
                        car_type: 'break',
                        amount: 56,
                        updatedAt: '2014-12-22 13:41:38',
                        UserId: 2,
                        Run: {
                            id: 3
                        }
                    },
                    user = { id: 2 };
                journey.setJourney(updateJourney);
                var tmp = journey.get();
                assert.equal(tmp.distance, '654 km');
                assert.equal(tmp.journey_type, 'aller-retour');
                assert.equal(tmp.car_type, 'break');
                assert.equal(tmp.amount, 56);
                journey.getById(2, function (err, selectJourney) {
                    if (err) return done(err);
                    assert.equal(selectJourney.distance, '754 km');
                    assert.equal(selectJourney.journey_type, 'aller');
                    assert.equal(selectJourney.car_type, 'citadine');
                    assert.equal(selectJourney.amount, 32);
                    assert.equal(selectJourney.RunId, 2);
                    assert.equal(selectJourney.UserId, 1);
                    journey.save(tmp, 2, 'user', function(err, updatedJourney) {
                        if (err) return done(err);
                        assert.equal(updatedJourney.id, 2);
                        assert.equal(updatedJourney.distance, '654 km');
                        assert.equal(updatedJourney.journey_type, 'aller-retour');
                        assert.equal(updatedJourney.car_type, 'break');
                        assert.equal(updatedJourney.amount, 56);
                        assert.equal(updatedJourney.RunId, 3);
                        assert.equal(updatedJourney.UserId, 2);
                        journey.getById(2, function (err, selectedJourney) {
                            if (err) return done(err);
                            assert.equal(selectedJourney.distance, '654 km');
                            assert.equal(selectedJourney.journey_type, 'aller-retour');
                            assert.equal(selectedJourney.car_type, 'break');
                            assert.equal(selectedJourney.amount, 56);
                            assert.equal(selectedJourney.RunId, 3);
                            assert.equal(selectedJourney.UserId, 2);
                            inbox.getList(user, function (err, messages) {
                                if (err) return done(err);
                                assert.include(messages[0].message, 'Updated Paris Saint Germain');
                                assert.include(messages[0].title, 'Paris Saint Germain');
                                return done();
                            });
                        });
                    });
                });
            });

            it('Add a partner to a journey', function (done) {
                var journey = new Journey(),
                    inbox = new Inbox(),
                    user = { id: 1 };

                journey.setJourney({});
                journey.getById(2, function (err, selectJourney) {
                    if (err) return done(err);
                    journey.setJourney(selectJourney);
                    var tmp = journey.get();
                    assert.equal(tmp.distance, '754 km');
                    assert.equal(tmp.journey_type, 'aller');
                    assert.equal(tmp.car_type, 'citadine');
                    assert.equal(tmp.amount, 32);
                    assert.equal(selectJourney.distance, '754 km');
                    assert.equal(selectJourney.journey_type, 'aller');
                    assert.equal(selectJourney.car_type, 'citadine');
                    assert.equal(selectJourney.amount, 32);
                    assert.equal(selectJourney.RunId, 2);
                    assert.equal(selectJourney.UserId, 1);
                    selectJourney.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNjcsImV4cCI6MTIwNTA5NDE5NzR9.fikQ6L2eYUBujEeV-OYMFfX_pER5eC2Z_nQJ0YVyb9w';
                    journey.save(selectJourney, selectJourney.UserId, 'user', function (err, updatedJourney) {
                        if (err) return done(err);
                        assert.equal(updatedJourney.distance, '754 km');
                        assert.equal(updatedJourney.journey_type, 'aller');
                        assert.equal(updatedJourney.car_type, 'citadine');
                        assert.equal(updatedJourney.amount, 32);
                        assert.equal(updatedJourney.RunId, 2);
                        assert.equal(updatedJourney.UserId, 1);
                        assert.equal(updatedJourney.PartnerId, 2);
                        inbox.getList(user, function (err, messages) {
                            if (err) return done(err);
                            assert.include(messages[0].message, 'Updated Les templiers');
                            assert.include(messages[0].title, 'Les templiers');
                            return done();
                        });
                    });
                });
            });
        });

        it('Notify user and driver for a join in journey', function (done) {
            var journey = new Journey(),
                inbox = new Inbox(),
                invoiceRef = 'MRT20150217H36EG';
            models.Invoice.find({ where: {ref: invoiceRef}, include: [{
                    model: models.Journey,
                    as: 'Journey',
                    include: [models.Run]
                }]})
                .then(function (invoice) {
                    journey.notifyJoin(invoice, function (err, msg) {
                        if (err) return done(err);
                        var user = {id:  invoice.UserId};
                        assert.equal(msg, 'done');
                        inbox.getList(user, function (err, messages) {
                            if (err) return done(err);
                            assert.equal(messages.length, 3);
                            assert.include(messages[0].message, 'User join validated Corrida de Saint Germain en Laye');
                            assert.include(messages[0].title, 'Corrida de Saint Germain en Laye');
                            var driver = {id: invoice.Journey.UserId};
                            inbox.getList(driver, function (err, messages) {
                                if (err) return done(err);
                                assert.equal(messages.length, 3);
                                assert.include(messages[0].message, 'Driver join validated Corrida de Saint Germain en Laye');
                                assert.include(messages[0].title, 'Corrida de Saint Germain en Laye');
                                return done();
                            });
                        });
                    });
                })
                .catch(function (err) {
                    return done(err);
                });
        });

        it('Get Journey to pay', function (done) {
            var journey = new Journey();

            journey.toPay()
                .then(function (journeys) {
                    assert.equal(journeys.length, 2);
                    assert.equal(journeys[0].Joins[0].Invoice.amount, 108.27);
                    assert.equal(journeys[0].Joins[0].Invoice.fees, 8.27);
                    assert.equal(journeys[0].Joins[0].Invoice.ref, 'MRT20150217LA6E9');
                    assert.equal(journeys[0].User.email, 'jbillay@gmail.com');
                    assert.equal(journeys[0].Run.name, 'Marathon du médoc');
                    assert.equal(journeys[1].Joins.length, 2);
                    assert.equal(journeys[1].Joins[0].ValidationJourney.comment_driver, 'Bon conducteur');
                    assert.equal(journeys[1].Joins[0].ValidationJourney.comment_service, 'Un grand merci à l\'équipe Myruntrip');
                    return done();
                })
                .catch(function(err) {
                    return done(err);
                });
        });

        it('Notify users for a modification in a journey', function (done) {
            var journey = new Journey(),
                inbox = new Inbox();
            models.Journey.find({ where: {id: 2}, include: [models.Run]})
                .then(function (selectedJourney) {
                    journey.notifyJoinedModification(selectedJourney, selectedJourney.Run)
                        .then(function (joins) {
                            assert.equal(joins.length, 2);
                            var user = {id:  3};
                            inbox.getList(user, function (err, messages) {
                                if (err) return done(err);
                                assert.equal(messages.length, 1);
                                assert.include(messages[0].message, 'Driver Updated Les templiers');
                                assert.include(messages[0].title, 'Email pour Les templiers');
                                var user2 = {id: 2};
                                inbox.getList(user2, function (err, messages) {
                                    if (err) return done(err);
                                    assert.equal(messages.length, 3);
                                    assert.include(messages[0].message, 'Driver Updated Les templiers');
                                    assert.include(messages[0].title, 'Email pour Les templiers');
                                    return done();
                                });
                            });
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
        describe('Test saveDraft', function () {
            it('Should save journey based on existing draft which fail to save', function (done) {
                var stubModel = {
                    User: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Run: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                };
                var stubPartner = function partner() {};
                stubPartner.prototype.getByToken = function (token) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubRedis = { createClient: function () { return {
                    get: function (key, callback) { return callback(null, JSON.stringify({id: 1, Run: {id: 1}})); },
                    set: function (key, string, print) { return true; }
                }; } };
                var Journey = proxyquire('../../server/objects/journey',
                    {'../models': stubModel, './inbox': stubInbox, './partner': stubPartner, 'redis': stubRedis});
                var journey = new Journey();
                journey.saveDraft('key', 2, function (err, journey) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test save', function () {
            it('Should save journey which fail to save', function (done) {
                var stubModel = {
                    User: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Run: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }
                };
                var stubUtil = function util() {};
                stubUtil.prototype.geocode = function (address) { var deferred = q.defer(); deferred.resolve({lng: 1, lat: 2}); return deferred.promise; };
                var stubPartner = function partner() {};
                stubPartner.prototype.getByToken = function (token) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                var stubRedis = { createClient: function () { return {
                    get: function (key, callback) { return callback(null, JSON.stringify({id: 1, Run: {id: 1}})); },
                    set: function (key, string, print) { return true; }
                }; } };
                var Journey = proxyquire('../../server/objects/journey',
                    {'../models': stubModel, './inbox': stubInbox, './partner': stubPartner, './utils': stubUtil, 'redis': stubRedis});
                var journey = new Journey();
                journey.save({id: 1, address_start: 'Chantilly', Run: {id: 2}, token: 'toto'}, 2, 'user', function (err, journey, run) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
            it('Should save journey which fail to find or create a journey', function (done) {
                var stubModel = {
                    User: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Run: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Journey: { findOrCreate: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } }
                };
                var stubUtil = function util() {};
                stubUtil.prototype.geocode = function (address) { var deferred = q.defer(); deferred.resolve({lng: 1, lat: 2}); return deferred.promise; };
                var stubPartner = function partner() {};
                stubPartner.prototype.getByToken = function (token) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                var stubRedis = { createClient: function () { return {
                    get: function (key, callback) { return callback(null, JSON.stringify({id: 1, Run: {id: 1}})); },
                    set: function (key, string, print) { return true; }
                }; } };
                var Journey = proxyquire('../../server/objects/journey',
                    {'../models': stubModel, './inbox': stubInbox, './partner': stubPartner, './utils': stubUtil, 'redis': stubRedis});
                var journey = new Journey();
                journey.save({id: 1, address_start: 'Chantilly', Run: {id: 2}, token: 'toto'}, 2, 'user', function (err, journey, run) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
            it('Should save journey which fail to add message in user inbox for a new journey', function (done) {
                var stubModel = {
                    User: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Run: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Journey: { findOrCreate: function (params) { var deferred = q.defer(); deferred.resolve([{
                        id: 1,
                        setRun: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                        setUser: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } }, true
                    ]); return deferred.promise; } }
                };
                var stubUtil = function util() {};
                stubUtil.prototype.geocode = function (address) { var deferred = q.defer(); deferred.resolve({lng: 1, lat: 2}); return deferred.promise; };
                var stubPartner = function partner() {};
                stubPartner.prototype.getByToken = function (token) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubRedis = { createClient: function () { return {
                    get: function (key, callback) { return callback(null, JSON.stringify({id: 1, Run: {id: 1}})); },
                    set: function (key, string, print) { return true; }
                }; } };
                var Journey = proxyquire('../../server/objects/journey',
                    {'../models': stubModel, './inbox': stubInbox, './partner': stubPartner, './utils': stubUtil, 'redis': stubRedis});
                var journey = new Journey();
                journey.save({id: 1, address_start: 'Chantilly', Run: {id: 2}, token: 'toto'}, 2, 'user', function (err, journey, run) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
            it('Should save journey which fail to add message in user inbox for an existing journey', function (done) {
                var stubModel = {
                    User: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Run: { findOne: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; } },
                    Journey: { findOrCreate: function (params) { var deferred = q.defer(); deferred.resolve([{
                        id: 1,
                        save:function (params) { var deferred = q.defer(); deferred.resolve({
                            id: 1,
                            setRun: function (params) { var deferred = q.defer(); deferred.resolve({id: 1}); return deferred.promise; },
                            setUser: function (params) { var deferred = q.defer(); deferred.resolve({
                                id: 1,
                                setPartner: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                            }); return deferred.promise; } }); return deferred.promise; } }, false
                    ]); return deferred.promise; } }
                };
                var stubUtil = function util() {};
                stubUtil.prototype.geocode = function (address) { var deferred = q.defer(); deferred.resolve({lng: 1, lat: 2}); return deferred.promise; };
                var stubPartner = function partner() {};
                stubPartner.prototype.getByToken = function (token) { var deferred = q.defer(); deferred.resolve('toto'); return deferred.promise; };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubRedis = { createClient: function () { return {
                    get: function (key, callback) { return callback(null, JSON.stringify({id: 1, Run: {id: 1}})); },
                    set: function (key, string, print) { return true; }
                }; } };
                var Journey = proxyquire('../../server/objects/journey',
                    {'../models': stubModel, './inbox': stubInbox, './partner': stubPartner, './utils': stubUtil, 'redis': stubRedis});
                var journey = new Journey();
                journey.save({id: 1, address_start: 'Chantilly', Run: {id: 2}, token: 'toto'}, 2, 'user', function (err, journey, run) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test getList', function () {
            it('Should get journey list which fail to find list', function (done) {
                var stubModel = { Journey: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Journey = proxyquire('../../server/objects/journey', {'../models': stubModel});
                var journey = new Journey();
                journey.getList(1, function (err, journey) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test getOpenList', function () {
            it('Should get open journey list which fail to find list', function (done) {
                var stubModel = { Journey: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Journey = proxyquire('../../server/objects/journey', {'../models': stubModel});
                var journey = new Journey();
                journey.getOpenList(function (err, journey) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test getBookSpace', function () {
            it('Should get booked space for a journey which fail to retrieve journey', function (done) {
                var stubModel = { Journey: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Journey = proxyquire('../../server/objects/journey', {'../models': stubModel});
                var journey = new Journey();
                journey.getBookSpace(1, function (err, journey) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test togglePayed', function () {
            it('Should get booked space for a journey which fail to retrieve journey', function (done) {
                var stubModel = { Journey: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Journey = proxyquire('../../server/objects/journey', {'../models': stubModel});
                var journey = new Journey();
                journey.togglePayed(1, function (err, journey) {
                    assert.equal(err, 'Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test cancelJoinsOfJourney', function () {
            it('Should cancel all joins of a journey which fail to list of join by journey', function (done) {
                var stubJoin = function join() {};
                stubJoin.prototype.getByJourney = function (id, callabck) { return callabck('Mock to fail', null); };
                var Journey = proxyquire('../../server/objects/journey', {'./join': stubJoin});
                var journey = new Journey();
                journey.cancelJoinsOfJourney(1, 'Maxicross')
                    .then(function (journey) {
                        return done('Should not cancel joins !');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test cancel', function () {
            it('Should cancel a journey which fail to find the journey', function (done) {
                var stubModel = { Journey: { find: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Journey = proxyquire('../../server/objects/journey', {'../models': stubModel});
                var journey = new Journey();
                journey.cancel(1, function (err, journey) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
            it('Should cancel a journey which fail to save the journey', function (done) {
                var stubModel = { Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    save: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; }
                }); return deferred.promise; } } };
                var Journey = proxyquire('../../server/objects/journey', {'../models': stubModel});
                var journey = new Journey();
                journey.cancel(1, function (err, journey) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
            it('Should cancel a journey which fail to cancel all joins', function (done) {
                var stubModel = { Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    save: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: {name: 'toto'}}); return deferred.promise; }
                }); return deferred.promise; } } };
                var stubJoin = function join() {};
                stubJoin.prototype.getByJourney = function (id, callabck) { return callabck('Mock to fail', null); };
                var Journey = proxyquire('../../server/objects/journey', {'./join': stubJoin, '../models': stubModel});
                var journey = new Journey();
                journey.cancel(1, function (err, journey) {
                    assert.equal(err, 'Error: Error: Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
            it('Should cancel a journey which fail to aadd message in the inbox', function (done) {
                var stubModel = { Journey: { find: function (params) { var deferred = q.defer(); deferred.resolve({
                    save: function (params) { var deferred = q.defer(); deferred.resolve({id: 1, Run: {name: 'toto'}}); return deferred.promise; }
                }); return deferred.promise; } } };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var stubJoin = function join() {};
                stubJoin.prototype.getByJourney = function (id, callabck) { return callabck(null, [{id: 1, UserId: 3}, {id: 2, UserId: 4}]); };
                var Journey = proxyquire('../../server/objects/journey', {'./join': stubJoin, './inbox': stubInbox, '../models': stubModel});
                var journey = new Journey();
                journey.cancel(1, function (err, journey) {
                    assert.equal(err, 'Error: Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test notifyJoin', function () {
            it('Should notify join which fail to find list', function (done) {
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Journey = proxyquire('../../server/objects/journey', {'./inbox': stubInbox});
                var journey = new Journey();
                journey.notifyJoin({id: 1, Journey: {Run: {name: 'toto'}, id: 3, UserId: 2}}, function (err, journey) {
                    assert.equal(err, 'Error: Journey notification : Mock to fail');
                    assert.isNull(journey);
                    return done();
                });
            });
        });
        describe('Test toPay', function () {
            it('Should get to pay journey list which fail to find list', function (done) {
                var stubModel = { Journey: { findAll: function (params) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; } } };
                var Journey = proxyquire('../../server/objects/journey', {'../models': stubModel});
                var journey = new Journey();
                journey.toPay()
                    .then(function (journey) {
                        return done('Should not cancel joins !');
                    })
                    .catch(function (err) {
                        assert.equal(err, 'Mock to fail');
                        return done();
                    });
            });
        });
        describe('Test notifyJoinedModification', function () {
            it('Should notify journey modification which fail to get linked joins', function (done) {
                var stubJoin = function join() {};
                stubJoin.prototype.getByJourney = function (id, callabck) { return callabck('Mock to fail', null); };
                var stubAsync = { queue: function () { var drain = function () { return done(); };
                    setTimeout(function () { drain(); }, 200);
                    return {
                        push: function (option, callback) { return callback('Mock to fail', null); },
                        drain: drain }; } };
                var Journey = proxyquire('../../server/objects/journey', {'./join': stubJoin, 'async': stubAsync});
                var journey = new Journey();
                journey.notifyJoinedModification({id: 1}, {id: 2})
                    .then(function (journey) {
                        return done('Should not notify journey modification !');
                    })
                    .catch(function (err) {
                        console.log(err);
                        assert.equal(err, 'Error: Mock to fail');
                        return done();
                    });
            });
            it('Should notify journey modification which fail to push message to queue', function (done) {
                var spyConsole = sinon.spy(console, 'log');
                var stubJoin = function join() {};
                stubJoin.prototype.getByJourney = function (id, callabck) { return callabck(null, [{id: 1, UserId: 3}, {id: 2, UserId: 4}]); };
                var stubAsync = { queue: function () { var drain = function () {
                    assert.isTrue(spyConsole.calledTwice); assert.equal(spyConsole.secondCall.args[0].toString(), 'Error: Message UserJourneyUpdated not sent : Mock to fail');
                    console.log.restore(); return done(); };
                    setTimeout(function () { drain(); }, 200);
                    return {
                        push: function (option, callback) { return callback('Mock to fail', null); },
                        drain: drain }; } };
                var Journey = proxyquire('../../server/objects/journey', {'./join': stubJoin, 'async': stubAsync});
                var journey = new Journey();
                journey.notifyJoinedModification({id: 1}, {id: 2})
                    .then(function (journey) {
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
            it('Should notify journey modification which fail to push message to queue', function (done) {
                var spyConsole = sinon.spy(console, 'log');
                var stubJoin = function join() {};
                stubJoin.prototype.getByJourney = function (id, callabck) { return callabck(null, [{id: 1, UserId: 3}, {id: 2, UserId: 4}]); };
                var stubInbox = function inbox() {};
                stubInbox.prototype.add = function (template, value, id) { var deferred = q.defer(); deferred.reject('Mock to fail'); return deferred.promise; };
                var Journey = proxyquire('../../server/objects/journey', {'./join': stubJoin, './inbox': stubInbox});
                var journey = new Journey();
                journey.notifyJoinedModification({id: 1}, {id: 2})
                    .then(function (journey) {
                        assert.isTrue(spyConsole.calledTwice);
                        assert.equal(spyConsole.secondCall.args[0].toString(), 'Error: Message UserJourneyUpdated not sent : Mock to fail');
                        console.log.restore();
                        return done();
                    })
                    .catch(function (err) {
                        return done(err);
                    });
            });
        });
    });
});