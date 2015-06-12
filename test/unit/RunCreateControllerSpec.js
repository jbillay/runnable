'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableRunCreateController', function(){
        var scope, rootScope, timeout, location, ctrl, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $timeout, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            location = $location;
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
            $httpBackend.whenPOST('/api/run').respond({msg: 'runCreated', type: 'success'});

            ctrl = $controller('RunnableRunCreateController',
                {$rootScope: rootScope, $scope: scope, $location: location});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.newRun.type).toEqual('trail');
            expect(scope.calendar.opened).not.toBeTruthy();
        });

        it ('Try to open calendar', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            scope.calendar.open(e);
            expect(scope.calendar.opened).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Get location', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            scope.getLocation('Paris, France');
        });

        it ('Get selected address', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            scope.selectedAddress('Paris, France');
        });

        it ('Submit a run', function () {
            spyOn(location, 'path');
            var newRun = {
                id: 3,
                name: 'Test',
                type: 'marathon',
                address_start: 'Tulles, France',
                date_start: '2015-09-15 00:00:00',
                time_start: '06:30',
                distances: '72km',
                elevations: '2500+',
                info: 'ksdjlsdjlf jsdlfjl sjdflj',
                is_active: 1
            };
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            scope.submitRun(newRun);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/run');
        });
    });
});