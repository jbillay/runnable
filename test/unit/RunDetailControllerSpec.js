'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableRunDetailController', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend, element;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, $controller,
                                   $compile, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $routeParams.runId = 4;
            service = Session;
            location = $location;
            $httpBackend.whenGET('/api/run/4').respond({
                id: 4,
                name: 'Maxicross',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'http://www.maxicross.fr',
                sticker: null,
                pictures: null,
                is_active: 1
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
                UserId: 2
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
                UserId: 2
            }]);
            $httpBackend.whenGET('/api/participate/run/user/list/4').respond([{
                id: 4,
                RunId: 4,
                UserId: 1
            },{
                id: 5,
                RunId: 4,
                UserId: 2
            }]);
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
            $httpBackend.whenPOST('/api/participate/add').respond({msg: 'addParticipate', type: 'success'});

            element = angular.element('<div class="journeyPanel" id="journeyPanel" style="height: 900px;"></div><div id="MyAffix"></div>');
            element.appendTo(document.body);
            element = $compile(element)(scope);
            scope.$digest();

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunDetailController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location});
        }));

        it ('Start controller', function () {
            service.id = 1;
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            scope.userJoined = false;
            $httpBackend.flush();
            timeout.flush();
            expect(scope.userJoined).toBeTruthy();
            expect(scope.nbJoiner).toBe(2);
            expect(scope.run.name).toEqual('Maxicross');
            expect(scope.journeyList.length).toBe(2);
        });

        it ('Test function after timeout', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
        });

        it ('Test bounce when the mouse in over', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            // TODO: need to create the marker before
            //scope.toggleBounce('toto');
        });

        it ('Test creation journey with user login', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.createJourney();
            expect(location.path).toHaveBeenCalledWith('/journey-create-4');
        });

        it ('Test creation journey without user login', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            service.destroy();
            scope.createJourney();
            expect(location.path).toHaveBeenCalledWith('/journey-create-4');
        });

        it ('Test run participation with user login', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.userJoined = false;
            expect(scope.participateList.length).toBe(2);
            scope.participateRun();
            $httpBackend.flush();
            expect(scope.participateList.length).toBe(3);
            expect(scope.userJoined).toBeTruthy();
        });

        it ('Test run participation without user login', function () {
            spyOn(scope, 'showLogin');
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            service.destroy();
            expect(scope.participateList.length).toBe(2);
            scope.participateRun();
            expect(scope.participateList.length).toBe(2);
            expect(scope.showLogin).toHaveBeenCalled();
        });
    });
    describe('RunnableRunDetailController with sticker provide', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend, element;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, $controller,
                                   $compile, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $routeParams.runId = 4;
            service = Session;
            location = $location;
            $httpBackend.whenGET('/api/run/4').respond({
                id: 4,
                name: 'Maxicross',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'http://www.maxicross.fr',
                sticker: 'http://www.myruntrip.com/picture-4.jpg',
                pictures: null,
                is_active: 1
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
                UserId: 2
            }, {
                id: 4,
                address_start: 'Nice',
                distance: '300 km',
                duration: '3 heures 10 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-06-25 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 1,
                date_start_return: null,
                time_start_return: null,
                nb_space_return: null,
                car_type: 'citadine',
                amount: 26,
                is_canceled: true,
                updatedAt: '2015-02-02 05:02:11',
                RunId: 4,
                UserId: 2
            }]);
            $httpBackend.whenGET('/api/participate/run/user/list/4').respond([{
                id: 4,
                RunId: 4,
                UserId: 1
            },{
                id: 5,
                RunId: 4,
                UserId: 2
            }]);
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
            $httpBackend.whenPOST('/api/participate/add').respond({msg: 'addParticipate', type: 'success'});

            element = angular.element('<div class="journeyPanel" id="journeyPanel" style="height: 10px;"></div><div id="MyAffix"></div>');
            element.appendTo(document.body);
            element = $compile(element)(scope);
            scope.$digest();

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunDetailController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location});
        }));

        it ('Start controller', function () {
            service.id = 1;
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            scope.userJoined = false;
            $httpBackend.flush();
            timeout.flush();
            expect(scope.userJoined).toBeTruthy();
            expect(scope.nbJoiner).toBe(2);
            expect(scope.run.name).toEqual('Maxicross');
            expect(scope.journeyList.length).toBe(2);
        });
    });    describe('RunnableRunDetailController without sitcker fo a none trail', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend, element;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, $controller,
                                   $compile, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $routeParams.runId = 4;
            service = Session;
            location = $location;
            $httpBackend.whenGET('/api/run/4').respond({
                id: 4,
                name: 'Maxicross',
                type: 'marathon',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'http://www.maxicross.fr',
                sticker: null,
                pictures: null,
                is_active: 1
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
                UserId: 2
            }, {
                id: 4,
                address_start: 'Nice',
                distance: '300 km',
                duration: '3 heures 10 minutes',
                journey_type: 'aller-retour',
                date_start_outward: null,
                time_start_outward: null,
                nb_space_outward: null,
                date_start_return: '2015-06-26 00:00:00',
                time_start_return: '11:00',
                nb_space_return: 1,
                car_type: 'citadine',
                amount: 26,
                is_canceled: true,
                updatedAt: '2015-02-02 05:02:11',
                RunId: 4,
                UserId: 2
            }]);
            $httpBackend.whenGET('/api/participate/run/user/list/4').respond([{
                id: 4,
                RunId: 4,
                UserId: 1
            },{
                id: 5,
                RunId: 4,
                UserId: 2
            }]);
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
            $httpBackend.whenPOST('/api/participate/add').respond({msg: 'addParticipate', type: 'success'});

            element = angular.element('<div class="runDetailJourneyDetailPanel" id="journeyPanel" style="height: 900px;"></div><div id="MyAffix"></div>');
            element.appendTo(document.body);
            element = $compile(element)(scope);
            scope.$digest();

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunDetailController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location});
        }));

        it ('Start controller', function () {
            service.id = 1;
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            scope.userJoined = false;
            $httpBackend.flush();
            timeout.flush();
            expect(scope.userJoined).toBeTruthy();
            expect(scope.nbJoiner).toBe(2);
            expect(scope.run.name).toEqual('Maxicross');
            expect(scope.journeyList.length).toBe(2);
        });

        it('Should make toggle bounce for a run', function () {
            // TODO: need to build map and maker before
            //scope.toggleBounce(1);
        });
    });
});