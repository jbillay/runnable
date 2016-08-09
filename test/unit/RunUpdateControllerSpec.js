'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableRunUpdateController for user allowed', function(){
        var scope, rootScope, timeout, location, ctrl, ctrlMain, mapAPI, $httpBackend, form;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location,
                                   $controller, GoogleMapApi, $compile) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $routeParams.runId = 4;
            timeout = $timeout;
            location = $location;
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
            $httpBackend.whenGET('http://res.cloudinary.com/myruntrip/image/upload/v1470754457/Run_4_Picture_38_development.jpg').respond({

            });
            $httpBackend.whenGET('http://res.cloudinary.com/myruntrip/image/upload/v1470754457/Run_4_Picture_39_development.jpg').respond({

            });
            $httpBackend.whenPUT('/api/run').respond({msg: 'runUpdated', type: 'success'});
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

            form = angular.element('<form name="updateRun" novalidate></form>');
            form.appendTo(document.body);
            form = $compile(form)(scope);
            scope.$digest();

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunUpdateController',
                {$rootScope: rootScope, $scope: scope, $location: location, $timeout: timeout, 'GoogleMapApi': mapAPI});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            expect(scope.calendar.opened).not.toBeTruthy();
        });

        it ('Try to open calendar', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            scope.calendar.open(e);
            expect(scope.calendar.opened).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Get location', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            scope.getLocation('Paris, France');
        });

        it ('Get selected address', function () {
            spyOn(mapAPI, 'selectedAddress');
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            scope.selectedAddress('Paris, France');
            expect(mapAPI.selectedAddress).toHaveBeenCalled();
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
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            scope.submitRun(scope.updateRun, newRun);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/run');
        });
    });
});