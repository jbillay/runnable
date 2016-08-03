/**
 * Created by jeremy on 05/02/15.
 */
'use strict';

process.env.NODE_ENV = 'test';

var assert = require('chai').assert;
var models = require('../../server/models/index');
var Journey = require('../../server/objects/journey');
var Join = require('../../server/objects/join');
var Inbox = require('../../server/objects/inbox');
var sinon = require('sinon');
var settings = require('../../conf/config');

describe('Test of journey object', function () {
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

    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log('Test of user over !');
    });

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
            this.timeout(15000);
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
            journey.setJourney(newJourney);
            var tmp = journey.get();
            assert.equal(tmp.distance, '25 km');
            assert.equal(tmp.journey_type, 'aller-retour');
            assert.equal(tmp.car_type, 'citadine');
            assert.equal(tmp.amount, 5);
            journey.save(tmp, user.id, 'admin', function(err, newJourney) {
                if (err) return done(err);
                assert.equal(newJourney.id, 6);
                assert.equal(newJourney.lat, 48.856614);
                assert.equal(newJourney.lng, 2.3522219);
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
                assert.equal(createdJourney.lat, 48.856614);
                assert.equal(createdJourney.lng, 2.3522219);
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
                    assert.equal(createdJourney.lat, 48.856614);
                    assert.equal(createdJourney.lng, 2.3522219);
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
        it('Update an existing journey', function (done) {
            var journey = new Journey(),
                inbox = new Inbox(),
                updateJourney = {
                    id: 2,
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
                assert.equal(selectJourney.lat, null);
                assert.equal(selectJourney.lng, null);
                assert.equal(selectJourney.distance, '754 km');
                assert.equal(selectJourney.journey_type, 'aller');
                assert.equal(selectJourney.car_type, 'citadine');
                assert.equal(selectJourney.amount, 32);
                assert.equal(selectJourney.RunId, 2);
                assert.equal(selectJourney.UserId, 1);
                journey.save(tmp, 2, 'user', function(err, updatedJourney) {
                    if (err) return done(err);
                    assert.equal(updatedJourney.id, 2);
                    assert.equal(updatedJourney.lat, 48.856614);
                    assert.equal(updatedJourney.lng, 2.3522219);
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

            journey.getById(2, function (err, selectJourney) {
                if (err) return done(err);
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