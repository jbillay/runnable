'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableJourneyDetailController user authorized', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, $controller, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $routeParams.journeyId = 4;
            service = Session;
            location = $location;
            $httpBackend.whenGET('/api/journey/4').respond({
                id: 4,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 4,
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
                    name: 'maxicross',
                    address_start: 'Paris, France'
                }
            });
            $httpBackend.whenGET('/api/join/journey/4').respond([{
                id: 1,
                nb_place_outward: 2,
                nb_place_return: null,
                UserId: 1,
                JourneyId: 4
            },
            {
                id: 2,
                nb_place_outward: 1,
                nb_place_return: null,
                UserId: 1,
                JourneyId: 4
            }]);
            $httpBackend.whenGET('/api/version').respond('DEV');
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

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableJourneyDetailController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.key_paypal).toEqual('622WFSZHPNBH4');
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(0);
        });

        it ('Count free space for outward', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.key_paypal).toEqual('622WFSZHPNBH4');
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(0);
            expect(scope.nbFreeSpaceOutward()).toBe(1);
        });

        it ('Count free space for return', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.key_paypal).toEqual('622WFSZHPNBH4');
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(0);
            expect(scope.nbFreeSpaceReturn()).toBe(0);
        });
    });

    describe('RunnableJourneyDetailController user not authorized', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, $controller, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $routeParams.journeyId = 4;
            service = Session;
            location = $location;
            $httpBackend.whenGET('/api/journey/4').respond({
                id: 4,
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
                is_canceled: true,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1,
                Run: {
                    name: 'maxicross',
                    address_start: 'Paris, France'
                }
            });
            $httpBackend.whenGET('/api/join/journey/4').respond([{
                id: 1,
                nb_place_outward: 2,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 4
            },
            {
                id: 2,
                nb_place_outward: 1,
                nb_place_return: null,
                UserId: 1,
                JourneyId: 4
            }]);
            $httpBackend.whenGET('/api/version').respond('sj3uE09');
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

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableJourneyDetailController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location});
        }));

        it ('Start controller', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(location.path).toHaveBeenCalledWith('/journey');
            expect(scope.key_paypal).toEqual('ST4SRXB6PJAGC');
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(2);
        });
    });
});