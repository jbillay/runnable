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
    window.google = {
        maps: {
            Geocoder: function() {
                this.geocode = function(input, fn) {
                    fn([{geometry: {location: 1}}], window.google.maps.GeocoderStatus.OK);
                };
            },
            Map: function(element, options) {
                this.setCenter = function (location) { return location; };
                this.setZoom = function (zoom) { return true; };
            },
            Marker: function (options) {
                this.addListener = function  (event, done) { return event; };
            },
            DirectionsRenderer: function() {
                this.setMap = function (location) { return location; };
                this.setDirections = function (response) { return response; };
            },
            InfoWindow: function (object) {
                this.open = function (map, marker) { return marker; };
            },
            DirectionsService: function () {
                this.route = function (request, fn) {
                    fn([{geometry: {location: 1}}], window.google.maps.GeocoderStatus.OK);
                };
            },
            DistanceMatrixService: function () {
                this.getDistanceMatrix = function (options, fn) {
                    fn({
                        origin_addresses: [ 'Greenwich, Greater London, UK', '13 Great Carleton Square, Edinburgh, City of Edinburgh EH16 4, UK' ],
                        destination_addresses: [ 'Stockholm County, Sweden', 'Dlouhá 609/2, 110 00 Praha-Staré Město, Česká republika' ],
                        rows: [ {
                            elements: [ {
                                status: 'OK',
                                duration: {
                                    value: 96000,
                                    text: '1 day 3 hours'
                                },
                                distance: {
                                    value: 2566737,
                                    text: '1595 mi'
                                }
                            }, {
                                status: 'OK',
                                duration: {
                                    value: 69698,
                                    text: '19 hours 22 mins'
                                },
                                distance: {
                                    value: 1942009,
                                    text: '1207 mi'
                                }
                            } ]
                        } ]
                    }, window.google.maps.GeocoderStatus.OK);
                };
            },
            TravelMode: { DRIVING: 1 },
            GeocoderStatus: { OK: 1 },
            DirectionsStatus: { OK: 1 },
            DistanceMatrixStatus: { OK: 1 }
        }
    };


    describe('GoogleMapApi Service', function() {

        beforeEach(inject(function(GoogleMapApi, _$httpBackend_, $rootScope){
            service = GoogleMapApi;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of GoogleMapApi', function() {
            expect(service).toBeDefined();
        });

        it('should init map', function () {
            service.initMap('test', 'Saint Germain en Laye, France');
            expect(rootScope.test.geocoder).toBeDefined();
            expect(rootScope.test.map).toBeDefined();
            expect(rootScope.test.directionsService).toBeDefined();
            expect(rootScope.test.directionsRenderer).toBeDefined();
        });

        it('should select address', function () {
            service.initMap('test');
            expect(rootScope.test.geocoder).toBeDefined();
            expect(rootScope.test.map).toBeDefined();
            expect(rootScope.test.directionsService).toBeDefined();
            expect(rootScope.test.directionsRenderer).toBeDefined();
            service.selectedAddress('test', 'Paris, France');
        });

        it('should show direction', function () {
            service.initMap('test');
            expect(rootScope.test.geocoder).toBeDefined();
            expect(rootScope.test.map).toBeDefined();
            expect(rootScope.test.directionsService).toBeDefined();
            expect(rootScope.test.directionsRenderer).toBeDefined();
            service.showDirection('test', 'Lyon, France', 'Paris, France');
        });

        it('should reset direction', function () {
            service.initMap('test');
            expect(rootScope.test.geocoder).toBeDefined();
            expect(rootScope.test.map).toBeDefined();
            expect(rootScope.test.directionsService).toBeDefined();
            expect(rootScope.test.directionsRenderer).toBeDefined();
            service.resetDirection('test');
        });

        it('should get distance', function () {
            var promise = service.getDistance('Paris, France', 'Lyon, France'),
                distance = null;

            promise.then(function(ret){
                distance = ret;
            });
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