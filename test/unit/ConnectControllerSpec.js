'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableConnectController', function () {
        var scope, rootScope, ctrl, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();

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
            
            ctrl = $controller('RunnableConnectController',
                {$scope: scope, $rootScope: rootScope});
        }));

        it('Start controller', function () {
            scope.getLocation('Paris');
            $httpBackend.flush();
        });

    });
});