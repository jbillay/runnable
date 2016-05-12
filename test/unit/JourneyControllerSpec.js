'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableJourneyController', function() {
        var scope, rootScope, timeout, ctrl, location, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, $timeout, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            location = $location;
            $httpBackend.whenGET('/api/journey/open').respond([{
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'retour',
                date_start_outward: null,
                time_start_outward: null,
                nb_space_outward: null,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1,
                Run: {
                    address_start: 'Paris, France'
                }
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
                UserId: 1,
                Run: {
                    address_start: 'Paris, France'
                }
            }]);

            ctrl = $controller('RunnableJourneyController', {$rootScope: rootScope, $scope: scope, $location: location});
        }));

        it('Start controller', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.journeyList.length).toBe(2);
        });

        it('Switch Display', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.displayModeIcon).toEqual('fa-list');
            expect(scope.displayMode).toEqual('list');
            scope.switchDisplay();
            timeout.flush();
            expect(scope.displayModeIcon).toEqual('fa-list');
            expect(scope.displayMode).toEqual('map');
            scope.switchDisplay();
            expect(scope.displayModeIcon).toEqual('fa-globe');
            expect(scope.displayMode).toEqual('list');
        });

        it('Switch Display Mode', function () {
            expect(scope.page).toEqual('Journey');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.displayModeIcon).toEqual('fa-list');
            scope.switchDisplayMode();
            expect(scope.displayModeIcon).toEqual('fa-globe');
            scope.switchDisplayMode();
            expect(scope.displayModeIcon).toEqual('fa-list');
        });

        it('Switch Display Mode', function () {
            spyOn(location, 'path');
            $httpBackend.flush();
            timeout.flush();
            scope.createJourney();
            expect(location.path).toHaveBeenCalledWith('/journey-create');
        });
    });
});