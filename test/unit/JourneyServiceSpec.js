/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Journey Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Journey Service', function() {

        beforeEach(inject(function(Journey, _$httpBackend_, $rootScope){
            service = Journey;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Journey', function() {
            expect(service).toBeDefined();
        });

        it('should get detail of a journey', function() {
            $httpBackend.whenGET('/api/journey/2').respond({
                id: 2,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 2,
                date_start_return: null,
                time_start_return: null,
                nb_space_return: null,
                car_type: 'citadine',
                amount: 32,
                is_canceled: false,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1
            });
            var promise = service.getDetail(2),
                journeyDetail = null;

            promise.then(function(ret){
                journeyDetail = ret;
            });
            $httpBackend.flush();
            expect(journeyDetail.id).toBe(2);
            expect(journeyDetail.address_start).toEqual('Nantes, France');
            expect(journeyDetail.distance).toEqual('754 km');
            expect(journeyDetail.duration).toEqual('6 heures 36 minute');
            expect(journeyDetail.journey_type).toEqual('aller');
            expect(journeyDetail.date_start_outward).toEqual('2015-06-02 00:00:00');
            expect(journeyDetail.time_start_outward).toEqual('03:00');
            expect(journeyDetail.nb_space_outward).toBe(2);
            expect(journeyDetail.date_start_return).toBe(null);
            expect(journeyDetail.time_start_return).toBe(null);
            expect(journeyDetail.nb_space_return).toBe(null);
            expect(journeyDetail.car_type).toBe('citadine');
            expect(journeyDetail.is_canceled).toBeFalsy();
            expect(journeyDetail.amount).toBe(32);
            expect(journeyDetail.RunId).toBe(2);
            expect(journeyDetail.UserId).toBe(1);
        });

        it('should fail to get detail of a journey', function() {
            $httpBackend.whenGET('/api/journey/2').respond(500);
            var promise = service.getDetail(2),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get list of open journey', function() {
            $httpBackend.whenGET('/api/journey/open').respond([{
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-09-06 00:00:00',
                time_start_outward: '06:00',
                nb_space_outward: 2,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1
            }, {
                id: 2,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 2,
                date_start_return: null,
                time_start_return: null,
                nb_space_return: null,
                car_type: 'citadine',
                amount: 32,
                is_canceled: false,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1
            }]);
            var promise = service.getOpenList(),
                journeyList = null;

            promise.then(function(ret){
                journeyList = ret;
            });
            $httpBackend.flush();
            expect(journeyList instanceof Array);
            expect(journeyList.length).toBe(2);
            expect(journeyList[1].id).toBe(2);
            expect(journeyList[1].address_start).toEqual('Nantes, France');
            expect(journeyList[1].distance).toEqual('754 km');
            expect(journeyList[1].duration).toEqual('6 heures 36 minute');
            expect(journeyList[1].journey_type).toEqual('aller');
            expect(journeyList[1].date_start_outward).toEqual('2015-06-02 00:00:00');
            expect(journeyList[1].time_start_outward).toEqual('03:00');
            expect(journeyList[1].nb_space_outward).toBe(2);
            expect(journeyList[1].date_start_return).toBe(null);
            expect(journeyList[1].time_start_return).toBe(null);
            expect(journeyList[1].nb_space_return).toBe(null);
            expect(journeyList[1].car_type).toBe('citadine');
            expect(journeyList[1].amount).toBe(32);
            expect(journeyList[1].is_canceled).toBeFalsy();
            expect(journeyList[1].RunId).toBe(2);
            expect(journeyList[1].UserId).toBe(1);
        });

        it('should fail to get list of open journey', function() {
            $httpBackend.whenGET('/api/journey/open').respond(500);
            var promise = service.getOpenList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get list of journey', function() {
            $httpBackend.whenGET('/api/admin/journeys').respond([{
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-09-06 00:00:00',
                time_start_outward: '06:00',
                nb_space_outward: 2,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1
            }, {
                id: 2,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 2,
                date_start_return: null,
                time_start_return: null,
                nb_space_return: null,
                car_type: 'citadine',
                amount: 32,
                is_canceled: true,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1
            }]);
            var promise = service.getList(),
                journeyList = null;

            promise.then(function(ret){
                journeyList = ret;
            });
            $httpBackend.flush();
            expect(journeyList instanceof Array);
            expect(journeyList.length).toBe(2);
            expect(journeyList[1].id).toBe(2);
            expect(journeyList[1].address_start).toEqual('Nantes, France');
            expect(journeyList[1].distance).toEqual('754 km');
            expect(journeyList[1].duration).toEqual('6 heures 36 minute');
            expect(journeyList[1].journey_type).toEqual('aller');
            expect(journeyList[1].date_start_outward).toEqual('2015-06-02 00:00:00');
            expect(journeyList[1].time_start_outward).toEqual('03:00');
            expect(journeyList[1].nb_space_outward).toBe(2);
            expect(journeyList[1].date_start_return).toBe(null);
            expect(journeyList[1].time_start_return).toBe(null);
            expect(journeyList[1].nb_space_return).toBe(null);
            expect(journeyList[1].car_type).toBe('citadine');
            expect(journeyList[1].amount).toBe(32);
            expect(journeyList[1].is_canceled).toBeTruthy();
            expect(journeyList[1].RunId).toBe(2);
            expect(journeyList[1].UserId).toBe(1);
        });

        it('should fail to get list of journey', function() {
            $httpBackend.whenGET('/api/admin/journeys').respond(500);
            var promise = service.getList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get list of journey for the run 4', function() {
            $httpBackend.whenGET('/api/journey/run/4').respond([{
                id: 3,
                address_start: 'Rouen',
                distance: '250 km',
                duration: '2 heures 45 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2014-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 4,
                date_start_return: '2014-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 12,
                is_canceled: false,
                updatedAt: '2015-02-02 05:02:11',
                RunId: 4,
                UserId: 2,
                Joins: [{
                        id: 1,
                        nb_place_outward: 2,
                        nb_place_return: 2,
                        UserId: 1,
                        JourneyId: 3,
                        Invoice: {
                            JoinId: 12,
                            JourneyId: null,
                            UserId: 1,
                            amount: 19.52,
                            createdAt: '2016-05-15T20:30:24.000Z',
                            driver_payed: false,
                            fees: 3.52,
                            id: 12,
                            ref: 'MRT201605156IEBT',
                            status: 'completed',
                            transaction: null,
                            updatedAt: '2016-05-15T20:30:24.000Z'
                        }
                    },
                    {
                        id: 2,
                        nb_place_outward: 1,
                        nb_place_return: null,
                        UserId: 1,
                        JourneyId: 3,
                        Invoice: {
                            JoinId: 12,
                            JourneyId: null,
                            UserId: 1,
                            amount: 19.52,
                            createdAt: '2016-05-15T20:30:24.000Z',
                            driver_payed: false,
                            fees: 3.52,
                            id: 12,
                            ref: 'MRT201605156IEBT',
                            status: 'pending',
                            transaction: null,
                            updatedAt: '2016-05-15T20:30:24.000Z'
                        }
                    }]
            }, {
                id: 4,
                address_start: 'Nice',
                distance: '300 km',
                duration: '3 heures 10 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-06-25 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 1,
                date_start_return: '2015-06-26 00:00:00',
                time_start_return: '11:00',
                nb_space_return: 1,
                car_type: 'citadine',
                amount: 26,
                is_canceled: true,
                updatedAt: '2015-02-02 05:02:11',
                RunId: 4,
                UserId: 2
            }]);
            var promise = service.getListForRun(4),
                journeyList = null;

            promise.then(function(ret){
                journeyList = ret;
            });
            $httpBackend.flush();
            expect(journeyList instanceof Array);
            expect(journeyList.length).toBe(2);
            expect(journeyList[0].RunId).toBe(4);
            expect(journeyList[0].nb_space_outward).toBe(2);
            expect(journeyList[0].nb_space_return).toBe(0);
            expect(journeyList[1].id).toBe(4);
            expect(journeyList[1].address_start).toEqual('Nice');
            expect(journeyList[1].distance).toEqual('300 km');
            expect(journeyList[1].duration).toEqual('3 heures 10 minutes');
            expect(journeyList[1].journey_type).toEqual('aller-retour');
            expect(journeyList[1].date_start_outward).toEqual('2015-06-25 00:00:00');
            expect(journeyList[1].time_start_outward).toEqual('09:00');
            expect(journeyList[1].nb_space_outward).toBe(1);
            expect(journeyList[1].date_start_return).toEqual('2015-06-26 00:00:00');
            expect(journeyList[1].time_start_return).toEqual('11:00');
            expect(journeyList[1].nb_space_return).toBe(1);
            expect(journeyList[1].car_type).toBe('citadine');
            expect(journeyList[1].amount).toBe(26);
            expect(journeyList[1].is_canceled).toBeTruthy();
            expect(journeyList[1].RunId).toBe(4);
            expect(journeyList[1].UserId).toBe(2);
            expect(journeyList[0].nb_space_outward).toBe(2);
            expect(journeyList[0].nb_space_return).toBe(0);
        });

        it('should fail to get list of journey for the run 4', function() {
            $httpBackend.whenGET('/api/journey/run/4').respond(500);
            var promise = service.getListForRun(4),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get next journey', function() {
            $httpBackend.whenGET('/api/journey/next/1').respond([{
                id: 3,
                address_start: 'Rouen',
                distance: '250 km',
                duration: '2 heures 45 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2014-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2014-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 12,
                is_canceled: false,
                updatedAt: '2015-02-02 05:02:11',
                RunId: 4,
                UserId: 2
            }]);
            var promise = service.getNextList(1),
                journeyList = null;

            promise.then(function(ret){
                journeyList = ret;
            });
            $httpBackend.flush();
            expect(journeyList instanceof Array);
            expect(journeyList.length).toBe(1);
            expect(journeyList[0].id).toBe(3);
            expect(journeyList[0].address_start).toEqual('Rouen');
            expect(journeyList[0].distance).toEqual('250 km');
            expect(journeyList[0].duration).toEqual('2 heures 45 minutes');
            expect(journeyList[0].journey_type).toEqual('aller-retour');
            expect(journeyList[0].date_start_outward).toEqual('2014-12-12 00:00:00');
            expect(journeyList[0].time_start_outward).toEqual('09:00');
            expect(journeyList[0].nb_space_outward).toBe(2);
            expect(journeyList[0].date_start_return).toEqual('2014-12-13 00:00:00');
            expect(journeyList[0].time_start_return).toEqual('09:00');
            expect(journeyList[0].nb_space_return).toBe(2);
            expect(journeyList[0].car_type).toBe('citadine');
            expect(journeyList[0].amount).toBe(12);
            expect(journeyList[0].is_canceled).toBeFalsy();
            expect(journeyList[0].RunId).toBe(4);
            expect(journeyList[0].UserId).toBe(2);
        });

        it('should fail to get next journey', function() {
            $httpBackend.whenGET('/api/journey/next/1').respond(500);
            var promise = service.getNextList(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should create a journey', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            var journey = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2
                },
                message = null;

            $httpBackend.whenPOST('/api/journey').respond({ msg: 'journeyCreated',
                                                            type: 'success',
                                                            journey: journey});

            var promise = service.create(journey);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual(journey);
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should create a journey with user not auth', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            var journey = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2
                },
                message = null;

            $httpBackend.whenPOST('/api/journey').respond({ msg: 'draftJourneyCreated',
                                                            type: 'success',
                                                            journeyKey: 'JNY564738'});

            var promise = service.create(journey);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('JNY564738');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to create a journey at back-end side', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            var journey = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2
                },
                message = null;

            $httpBackend.whenPOST('/api/journey').respond({ msg: 'journeyNotCreated',
                                                            type: 'error'});

            var promise = service.create(journey);

            promise.then(function(ret){
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to create a journey', function () {
            $httpBackend.whenPOST('/api/journey').respond(500);

            var journey = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2
                },
                message = null;

            var promise = service.create(journey);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should confirm a journey', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            var journeyKey = 'JNY567483',
                message = null;

            $httpBackend.whenPOST('/api/journey/confirm').respond({msg: 'draftJourneySaved', type: 'success',
                journey: { id: 1, Run: { name: 'Maxicross' }}});

            var promise = service.confirm(journeyKey);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.Run.name).toEqual('Maxicross');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should confirm a journey but failed in back-end side', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            var journeyKey = 'JNY567483',
                message = null;

            $httpBackend.whenPOST('/api/journey/confirm').respond({msg: 'draftJourneyNotSaved', type: 'error',
                journey: { id: 1, Run: { name: 'Maxicross' }}});

            var promise = service.confirm(journeyKey);

            promise.then(function(ret){
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should confirm a journey failed', function () {
            var journeyKey = 'JNY567483',
                message = null;

            $httpBackend.whenPOST('/api/journey/confirm').respond(500);

            var promise = service.confirm(journeyKey);

            promise.then(function(ret){
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should update a journey', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPUT('/api/journey').respond({msg: 'journeyUpdated', type: 'success'});

            var journey = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2
                },
                message = null;

            var promise = service.update(journey);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('journeyUpdated');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to update with an error a journey', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPUT('/api/journey').respond({msg: 'journeyNotUpdated', type: 'error'});

            var journey = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2
                },
                message = null;

            var promise = service.update(journey);

            promise.then(function(ret){
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should failed to update a journey', function () {
            $httpBackend.whenPUT('/api/journey').respond(500);

            var journey = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2
                },
                message = null;

            var promise = service.update(journey);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should mark journey as payed', function () {
            $httpBackend.whenPOST('/api/admin/journey/payed').respond('journeyTogglePayed');

            var message = null;

            var promise = service.togglePayed(2);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('journeyTogglePayed');
        });

        it('should failed to  mark journey as payed', function () {
            $httpBackend.whenPOST('/api/admin/journey/payed').respond(500);

            var message = null;

            var promise = service.togglePayed(2);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should mark journey as cancelled', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/journey/cancel').respond('journeyCanceled');

            var message = null;

            var promise = service.cancel(2);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('journeyCanceled');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to  mark journey as cancelled', function () {
            $httpBackend.whenPOST('/api/journey/cancel').respond(500);

            var message = null;

            var promise = service.cancel(2);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get journey to pay', function () {
            $httpBackend.whenGET('/api/admin/journey/toPay').respond({msg: [{
                id: 3,
                address_start: 'Rouen',
                distance: '250 km',
                duration: '2 heures 45 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2014-12-12 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 2,
                date_start_return: '2014-12-13 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 2,
                car_type: 'citadine',
                amount: 12,
                is_canceled: false,
                updatedAt: '2015-02-02 05:02:11',
                RunId: 4,
                UserId: 2
            }, {
                id: 4,
                address_start: 'Nice',
                distance: '300 km',
                duration: '3 heures 10 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-06-25 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 1,
                date_start_return: '2015-06-26 00:00:00',
                time_start_return: '11:00',
                nb_space_return: 1,
                car_type: 'citadine',
                amount: 26,
                is_canceled: true,
                updatedAt: '2015-02-02 05:02:11',
                RunId: 4,
                UserId: 2
            }], type: 'success'});

            var message = null;

            var promise = service.toPay();

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.length).toBe(2);
        });

        it('should get error when retrieve journey to pay', function () {
            $httpBackend.whenGET('/api/admin/journey/toPay').respond({msg: 'Message incorrect', type: 'error'});

            var message = null;

            var promise = service.toPay();

            promise.then(function(ret){
                message = ret;
            }).catch(function (err) {
                message = err;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should failed to retrieve journeys to pay', function () {
            $httpBackend.whenGET('/api/admin/journey/toPay').respond(500);

            var message = null;

            var promise = service.toPay();

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });
    });
});