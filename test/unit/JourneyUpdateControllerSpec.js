'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableJourneyUpdateController with route params', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $timeout, $routeParams, $location, $controller, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            service = Session;
            location = $location;
            $routeParams.journeyId = 1;
            $httpBackend.whenGET('/api/run/list').respond([{
                id: 1,
                name: 'Maxicross',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'Toutes les infos sur le maxicross',
                is_active: 1
            },
                {
                    id: 2,
                    name: 'Les templiers',
                    type: 'trail',
                    address_start: 'Millau, France',
                    date_start: '2015-09-15 00:00:00',
                    time_start: '06:30',
                    distances: '72km',
                    elevations: '2500+',
                    info: 'ksdjlsdjlf jsdlfjl sjdflj',
                    is_active: 1
                }]);
            $httpBackend.whenGET('/api/journey/1').respond({
                id: 1,
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
                UserId: 1,
                Run: {
                    id: 2,
                    name: 'Maxicross'
                }
            });
            $httpBackend.whenGET('/api/user/me').respond({
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'Saint-Germain-en-Laye',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                itra: null,
                isActive: 1,
                role: 'admin',
                picture: null
            });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableJourneyUpdateController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(1);
            $httpBackend.flush();
            timeout.flush();
            var parcours = [
                    {code: 'aller-retour', name: 'Aller-Retour'},
                    {code: 'aller', name: 'Aller'},
                    {code: 'retour', name: 'Retour'}],
                cars = [
                    {code: 'citadine', name: 'Citadine'},
                    {code: 'berline', name: 'Berline'},
                    {code: 'break', name: 'Break'},
                    {code: 'monospace', name: 'Monospace'},
                    {code: 'suv', name: '4x4, SUV'},
                    {code: 'coupe', name: 'Coupé'},
                    {code: 'cabriolet', name: 'Cabriolet'}
                ];
            expect(scope.runList.length).toBe(2);
            expect(scope.outward).toBeTruthy();
            expect(scope.return).not.toBeTruthy();
            expect(scope.parcoursModeList).toEqual(parcours);
            expect(scope.carTypeList).toEqual(cars);
            expect(scope.journey.journey_type).toEqual('aller');
            expect(scope.journey.car_type).toEqual('citadine');
            expect(scope.journey.Run.name).toEqual('Les templiers');
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            scope.calendar.open(e, 'test');
            expect(scope.calendar.opened.test).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Get location', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            scope.getLocation('Paris, France');
        });

        it ('Show Map info', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            scope.selectSource('Paris, France');
            scope.showMapInfo();
        });

        it ('Show Map info', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            scope.selectSource('Paris, France');
            scope.selectDestination(scope.journey.Run);
        });

        it ('Change journey type to outward', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            scope.journey.journey_type = 'aller';
            scope.journeyTypeChange();
            timeout.flush();
            expect(scope.outward).toBeTruthy();
            expect(scope.return).not.toBeTruthy();
            expect(scope.journey.date_start_return).toBeNull();
            expect(scope.journey.time_start_return).toBeNull();
            expect(scope.journey.nb_space_return).toBeNull();
        });

        it ('Change journey type to return', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            scope.journey.journey_type = 'retour';
            scope.journeyTypeChange();
            timeout.flush();
            expect(scope.outward).not.toBeTruthy();
            expect(scope.return).toBeTruthy();
            expect(scope.journey.date_start_outward).toEqual('2015-06-02 00:00:00');
            expect(scope.journey.time_start_outward).toEqual('03:00');
            expect(scope.journey.nb_space_outward).toBe(2);
        });

        it ('Change journey type to outward and back to outward-return', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            scope.journey.journey_type = 'aller';
            scope.journeyTypeChange();
            timeout.flush();
            expect(scope.outward).toBeTruthy();
            expect(scope.return).not.toBeTruthy();
            scope.journey.journey_type = 'aller-retour';
            scope.journeyTypeChange();
            timeout.flush();
            expect(scope.outward).toBeTruthy();
            expect(scope.return).toBeTruthy();
        });

        it ('Submit Journey', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            var journeyAR = {
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
                    UserId: 2,
                    Run: {
                        name: 'test'
                    }
                },
                journeyR = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'retour',
                    date_start_outward: null,
                    time_start_outward: null,
                    nb_space_outward: null,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2,
                    Run: {
                        name: 'test'
                    }
                },
                journeyA = {
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: null,
                    time_start_return: null,
                    nb_space_return: null,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    updatedAt: '2015-02-02 05:02:11',
                    RunId: 4,
                    UserId: 2,
                    Run: {
                        name: 'test'
                    }
                };
            scope.submitJourney(journeyAR);
            scope.submitJourney(journeyA);
            scope.submitJourney(journeyR);
        });
    });
});