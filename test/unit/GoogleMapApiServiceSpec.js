/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('GoogleMapApi Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('GoogleMapApi Service', function() {

        beforeEach(inject(function(GoogleMapApi, _$httpBackend_, $rootScope){
            service = GoogleMapApi;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of GoogleMapApi', function() {
            expect(service).toBeDefined();
        });

        it('should get geo location', function() {
            $httpBackend.whenGET('http://maps.googleapis.com/maps/api/geocode/json?address=Paris&sensor=false').respond({
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
            var promise = service.getLocation('Paris'),
                locationList = null;

            promise.then(function(ret){
                locationList = ret;
            });
            $httpBackend.flush();
            expect(locationList instanceof Array).toBeTruthy();
            expect(locationList[0]).toEqual('Paris, France');
        });
    });
});