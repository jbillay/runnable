'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableRunController', function(){
        var scope, rootScope, timeout, location, ctrl, mapAPI, $httpBackend, DEFAULT_DISTANCE;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $timeout, $location, $controller, GoogleMapApi) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            location = $location;
            mapAPI = GoogleMapApi;
            DEFAULT_DISTANCE = 30;
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
            $httpBackend.whenPOST('/api/run/search').respond([{
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

            ctrl = $controller('RunnableRunController',
                {$rootScope: rootScope, $scope: scope, $timeout: timeout, 'GoogleMapApi': mapAPI, 'DEFAULT_DISTANCE': DEFAULT_DISTANCE});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(2);
            expect(scope.calendar.opened).toEqual({});
        });

        it ('Try to open calendar', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            scope.calendar.open(e, 'test');
            expect(scope.calendar.opened.test).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Get location', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            scope.getLocation('Paris, France');
        });

        it ('Switch search', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(2);
            expect(scope.calendar.opened).toEqual({});
            scope.switchSearch();
            timeout.flush();
            expect(scope.advancedSearch).toBe(1);
            scope.switchSearch();
            timeout.flush();
            expect(scope.advancedSearch).toBe(0);
        });

        it ('Reset search', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(2);
            expect(scope.calendar.opened).toEqual({});
            scope.switchSearch();
            timeout.flush();
            expect(scope.advancedSearch).toBe(1);
            scope.resetSearch();
            $httpBackend.flush();
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(1);
        });

        it ('Launch search', function () {
            var advancedSearch = {
                    run_adv_distance: 30,
                    run_name: 'test'
                },
                advancedSearch2 = {};
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            scope.run_name = 'test';
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(2);
            expect(scope.calendar.opened).toEqual({});
            scope.launchSearch(advancedSearch);
            $httpBackend.flush();
            expect(scope.listRun.length).toBe(1);
            scope.resetSearch();
            $httpBackend.flush();
            expect(scope.advancedSearch).toBe(0);
            scope.launchSearch(advancedSearch2);
            $httpBackend.flush();
            expect(scope.listRun.length).toBe(1);
        });

        it ('Open run proposal', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            scope.openRunProposal();
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(2);
            expect(scope.calendar.opened).toEqual({});
        });

        it ('Cancel run proposal', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            scope.cancelRunProposal();
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(2);
            expect(scope.calendar.opened).toEqual({});
        });

        it ('Submit run proposal', function () {
            var form = {
                runName: 'Test',
                runEmail: 'test@test.com',
                runType: 'trail',
                runDate: '12/10/2016',
                runLink: 'www.myruntrip.com'
            };
            expect(scope.page).toEqual('Run');
            expect(scope.default_distance).toBe(30);
            expect(scope.searchForm.run_adv_type).toEqual('');
            expect(scope.run_name).toEqual('');
            $httpBackend.flush();
            timeout.flush();
            scope.submitRunProposal(form);
            expect(scope.advancedSearch).toBe(0);
            expect(scope.listRun.length).toBe(2);
            expect(scope.calendar.opened).toEqual({});
        });
    });
});