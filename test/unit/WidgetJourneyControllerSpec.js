'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableWidgetJourneyController', function(){
        var scope, rootScope, timeout, ctrl, mapAPI, $httpBackend, Journey, AuthService, User;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location,
                                   $controller, GoogleMapApi, _Journey_, _AuthService_, _User_) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            Journey = _Journey_;
            AuthService = _AuthService_;
            User = _User_;
            $routeParams.runId = 4;
            timeout = $timeout;
            mapAPI = GoogleMapApi;
            $httpBackend.whenGET('/api/run/4').respond({
                id: 4,
                name: 'Maxicross',
                slug: 'maxicross',
                lat: '43.2939345',
                lng: '5.386939099999999',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'http://www.maxicross.fr',
                pictures: [],
                sticker: null,
                is_active: 1,
                UserId: 4,
                PartnerId: null,
                createdAt: '2016-08-07T12:15:00.000Z',
                updatedAt: '2016-08-07T12:15:00.000Z',
            });
            $httpBackend.whenGET('https://maps.googleapis.com/maps/api/geocode/json?address=Paris&sensor=false').respond({
                results: [
                    {
                        address_components: [
                            {
                                long_name: 'Paris',
                                short_name: 'Paris',
                                types: [ 'locality', 'political' ]
                            },
                            {
                                long_name: 'Paris',
                                short_name: '75',
                                types: [ 'administrative_area_level_2', 'political' ]
                            },
                            {
                                long_name: 'Île-de-France',
                                short_name: 'IDF',
                                types: [ 'administrative_area_level_1', 'political' ]
                            },
                            {
                                long_name: 'France',
                                short_name: 'FR',
                                types: [ 'country', 'political' ]
                            }
                        ],
                        formatted_address: 'Paris, France',
                        geometry: {
                            bounds: {
                                northeast: {
                                    lat: 48.9021449,
                                    lng: 2.4699208
                                },
                                southwest: {
                                    lat: 48.815573,
                                    lng: 2.224199
                                }
                            },
                            location: {
                                lat: 48.856614,
                                lng: 2.3522219
                            },
                            location_type: 'APPROXIMATE',
                            viewport: {
                                northeast: {
                                    lat: 48.9021449,
                                    lng: 2.4699208
                                },
                                southwest: {
                                    lat: 48.815573,
                                    lng: 2.224199
                                }
                            }
                        },
                        place_id: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
                        types: [ 'locality', 'political' ]
                    }
                ],
                status: 'OK'
            });
            ctrl = $controller('RunnableWidgetJourneyController',
                {$rootScope: rootScope, $scope: scope, $timeout: timeout, 'GoogleMapApi': mapAPI});
        }));

        it ('Start controller', function () {
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.runDetail.name).toEqual('Maxicross');
            expect(scope.destination).toEqual('Bouffémont, France');
        });

        it ('Open calendar', function () {
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.runDetail.name).toEqual('Maxicross');
            expect(scope.destination).toEqual('Bouffémont, France');
            scope.calendar.open(e);
            expect(scope.calendar.opened).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Change journey type to outward', function () {
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
            $httpBackend.flush();
            timeout.flush();
            scope.journey.journey_type = 'retour';
            scope.journeyTypeChange();
            timeout.flush();
            expect(scope.outward).not.toBeTruthy();
            expect(scope.return).toBeTruthy();
            expect(scope.journey.date_start_outward).toBeNull();
            expect(scope.journey.time_start_outward).toBeNull();
            expect(scope.journey.nb_space_outward).toBeNull();
        });

        it ('Change journey type to outward and back to outward-return', function () {
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

        it ('Get location', function () {
            $httpBackend.flush();
            timeout.flush();
            scope.getLocation('Paris, France');
        });

        it ('Select address as source', function () {
            $httpBackend.flush();
            timeout.flush();
            scope.selectSource('Paris, France');
            rootScope.$digest();
            expect(scope.journey.distance).toEqual('1595 mi');
            expect(scope.journey.duration).toEqual('1 day 3 hours');
        });

        it ('Save journey', function () {
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
            };
            spyOn(Journey, 'create').and.callFake(function() {
                return { then: function(callback) { return callback('JNY82651'); } }; });
            expect(scope.steps.creation).toBe(1);
            expect(scope.steps.auth).toBe(0);
            $httpBackend.flush();
            timeout.flush();
            scope.saveJourney(journey);
            rootScope.$digest();
            expect(Journey.create).toHaveBeenCalled();
            expect(scope.journeyConfirmCode).toEqual('JNY82651');
            expect(scope.steps.creation).toBe(0);
            expect(scope.steps.auth).toBe(1);
        });

        it ('User login', function () {
            spyOn(Journey, 'confirm').and.callFake(function() {
                return { then: function(callback) { return callback({id: 1}); } }; });
            spyOn(AuthService, 'login').and.callFake(function() {
                return { then: function(callback) { return callback({id: 1}); } }; });
            expect(scope.steps.creation).toBe(1);
            expect(scope.steps.auth).toBe(0);
            expect(scope.steps.confirm).toBe(0);
            $httpBackend.flush();
            timeout.flush();
            scope.widgetLogin({email: 'jbillay@gmail.com', password: 'noofs'});
            rootScope.$digest();
            expect(scope.newJourney.id).toBe(1);
            expect(scope.steps.auth).toBe(0);
            expect(scope.steps.confirm).toBe(1);
        });

        it ('User creation', function () {
            spyOn(Journey, 'confirm').and.callFake(function() {
                return { then: function(callback) { return callback({id: 1}); } }; });
            spyOn(User, 'create').and.callFake(function() {
                return { then: function(callback) { return callback({id: 1}); } }; });
            expect(scope.steps.creation).toBe(1);
            expect(scope.steps.auth).toBe(0);
            expect(scope.steps.confirm).toBe(0);
            $httpBackend.flush();
            timeout.flush();
            scope.widgetCreateUser({email: 'jbillay@gmail.com', password: 'noofs'});
            rootScope.$digest();
            expect(scope.newJourney.id).toBe(1);
            expect(scope.steps.auth).toBe(0);
            expect(scope.steps.confirm).toBe(1);
        });

    });
});