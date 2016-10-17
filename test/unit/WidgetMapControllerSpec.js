'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableWidgetMapController', function(){
        var scope, rootScope, timeout, ctrl, mapAPI, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location,
                                   $controller, GoogleMapApi) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
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
                updatedAt: '2016-08-07T12:15:00.000Z'
            });
            $httpBackend.whenGET('/api/journey/run/4').respond([{
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
                Run: { name: 'Maxicross' }
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
                UserId: 2,
                Run: { name: 'Maxicross' }
            }]);
            ctrl = $controller('RunnableWidgetMapController',
                {$rootScope: rootScope, $scope: scope, $timeout: timeout, 'GoogleMapApi': mapAPI});
        }));

        it ('Start controller', function () {
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.journeyList.length).toBe(2);
            expect(scope.runDetail.name).toEqual('Maxicross');
        });
    });
});