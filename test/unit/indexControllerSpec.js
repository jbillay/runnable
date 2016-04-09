'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableIndexController', function(){
        var scope, rootScope, ctrl, $httpBackend, timeout;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $controller, $timeout) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            spyOn(rootScope, '$broadcast').and.callThrough();

            $httpBackend.whenGET('/api/run/next/4').respond([{
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
            }]);
            $httpBackend.whenGET('/api/journey/next/4').respond([{
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
                UserId: 2,
                Run: {
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
                }
            }]);
            $httpBackend.whenGET('/api/home/feedback').respond([{
                id: 1,
                comment_driver: 'Conducteur moyen',
                comment_service: 'Myruntrip est vraiment un service de qualité. Merci pour tout votre travail',
                rate_driver: 3,
                rate_service: 5,
                JoinId: 4,
                UserId: 1
            }]);
            $httpBackend.whenPOST('/api/send/mail').respond('message envoyé');
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

            ctrl = $controller('RunnableIndexController', {$rootScope: rootScope, $scope: scope});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Index');
            expect(scope.nbRunItems).toBe(4);
            expect(scope.nbJourneyItems).toBe(4);
        });

        it ('Simulate timeout call', function () {
            expect(scope.page).toEqual('Index');
            expect(scope.nbRunItems).toBe(4);
            expect(scope.nbJourneyItems).toBe(4);
            $httpBackend.flush();
            timeout.flush();
        });

        it ('Get location', function () {
            expect(scope.page).toEqual('Index');
            expect(scope.nbRunItems).toBe(4);
            expect(scope.nbJourneyItems).toBe(4);
            scope.getLocation('Paris');
            $httpBackend.flush();
        });

        it ('Send contact email', function () {
            var contact = {
                demande: 'Titre',
                email: 'richard.couret@free.fr',
                content: 'Unit test send contact email'
            };
            expect(scope.page).toEqual('Index');
            expect(scope.nbRunItems).toBe(4);
            expect(scope.nbJourneyItems).toBe(4);
            scope.sendContact(contact);
            $httpBackend.flush();
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });
    });
});