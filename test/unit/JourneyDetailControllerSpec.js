'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableJourneyDetailController user authorized with outward only', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, $controller, $compile, Session) {
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
                UserId: 2,
                JourneyId: 4
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
            $httpBackend.whenPOST('/api/inbox/msg').respond({
                id: 10,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'test à la con',
                is_read: 0,
                UserId: 1,
                createdAt: '2015-01-28 09:57:02'
            });
            $httpBackend.whenGET('/api/join/cancel/1').respond({msg: 'joinCancelled', type: 'success'});
            $httpBackend.whenGET('/api/discussion/public/messages/4').respond([{
                id: 4,
                message: 'test à la con',
                is_public: true,
                UserId: 2,
                JourneyId: 2,
                createdAt: '2015-01-28 09:57:02'
            },{
                id: 5,
                message: 'je sais que ça va marcher',
                is_public: true,
                UserId: 1,
                JourneyId: 2,
                createdAt: '2015-01-28 11:29:13'
            }]);
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
            expect(scope.joined).toBe(1);
            expect(scope.owned).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(0);
        });

        it ('Count free space for outward', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.joined).toBe(1);
            expect(scope.owned).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(0);
            expect(scope.nbFreeSpaceOutward()).toBe(1);
        });

        it ('Count free space for return', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.joined).toBe(1);
            expect(scope.owned).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(0);
            expect(scope.nbFreeSpaceReturn()).toBe(0);
        });

        it ('Get free space for the whole journey', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.nbFreeSpace()).toBe(1);
        });

        it ('Get message date using moment', function () {
            // TODO: Fake time to be sure to have the same message date
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.publicMessages.length).toBe(2);
            angular.forEach(scope.publicMessages, function (message) {
                expect(message.showDate).toEqual('2 years ago');
            });
        });

        it ('Start check for that journey', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            scope.joined = 0;
            $httpBackend.flush();
            timeout.flush();
            scope.startCheckout();
            expect(location.path).toHaveBeenCalledWith('/checkout-4');
        });

        it ('Ask Validation Join Cancel From Journey', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.askValidationJoinCancelFromJourney();
            expect(scope.validationMessage).toContain('Vous souhaitez annuler votre participation à ce voyage');
            expect(angular.isFunction(scope.validationCallback)).toBeTruthy();
        });

        it ('Cancel validation for join cancel', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.cancelValidation();
        });

        it ('Confirm validation for join cancel', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.confirmValidation();
            expect(scope.joined).toBe(0);
            expect(scope.reserved_outward).toBe(1);
            expect(scope.reserved_return).toBe(0);
            $httpBackend.flush();
        });

        it ('Check if a message is posted and not filtered', function () {
           // TODO: all
        });

        it ('Check if a message is posted and filtered', function () {
           // TODO: all
        });
    });

    describe('RunnableJourneyDetailController user authorized with return only', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, $controller, $compile, Session) {
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
                date_start_outward: null,
                time_start_outward: null,
                nb_space_outward: null,
                date_start_return: '2015-06-02 00:00:00',
                time_start_return: '03:00',
                nb_space_return: 4,
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
                nb_place_outward: null,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 4
            },
            {
                id: 2,
                nb_place_outward: null,
                nb_place_return: 1,
                UserId: 2,
                JourneyId: 4
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
            $httpBackend.whenPOST('/api/inbox/msg').respond({
                id: 10,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'test à la con',
                is_read: 0,
                UserId: 1,
                createdAt: '2015-01-28 09:57:02'
            });
            $httpBackend.whenPOST('/api/join').respond('userJoined');
            $httpBackend.whenGET('/api/join/cancel/1').respond({msg: 'joinCancelled', type: 'success'});
            $httpBackend.whenGET('/api/discussion/public/messages/4').respond([{
                id: 4,
                message: 'test à la con',
                is_public: true,
                UserId: 2,
                JourneyId: 2,
                createdAt: '2015-01-28 09:57:02'
            },{
                id: 5,
                message: 'je sais que ça va marcher',
                is_public: true,
                UserId: 1,
                JourneyId: 2,
                createdAt: '2015-01-28 11:29:13'
            }]);
            $httpBackend.whenPOST('/api/discussion/public/message').respond('ok');
            var formElem = angular.element('<form ng-form-commit name="form"><input type="text" name="number"></form>');
            $compile(formElem)(scope);

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
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(0);
            expect(scope.reserved_return).toBe(3);
        });

        it ('Count free space for outward', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(0);
            expect(scope.reserved_return).toBe(3);
            expect(scope.nbFreeSpaceOutward()).toBe(0);
        });

        it ('Count free space for return', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(0);
            expect(scope.reserved_return).toBe(3);
            expect(scope.nbFreeSpaceReturn()).toBe(1);
        });

        it ('Confirm validation for join cancel', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.confirmValidation();
            expect(scope.joined).toBe(0);
            expect(scope.reserved_outward).toBe(0);
            expect(scope.reserved_return).toBe(1);
            $httpBackend.flush();
        });

        it ('Send message to public discussion', function () {
            var discussion = {
                newMessageEntry: 'test',
                userEmailEntry: 'toto@titi.com'
            };
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.publicMessages.length).toBe(2);
            scope.sendMessage(discussion);
            expect(scope.publicMessages.length).toBe(3);
            $httpBackend.flush();
        });

        it ('Send a message with phone number which is not allowed in public discussion', function () {
            var discussion = {
                newMessageEntry: '0689896547',
                userEmailEntry: 'myruntrip@gmail.com'
            };
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.publicMessages.length).toBe(2);
            scope.sendMessage(discussion);
            expect(scope.publicMessages.length).toBe(2);
            expect(scope.messageFilter).toBeTruthy();
        });

        it ('Send a message with an email which is not allowed in public discussion', function () {
            var discussion = {
                newMessageEntry: 'Bonjour vous pouvez me contacter sur mon mail jbillay@gmail.com comme ça on va les avoir :) !',
                userEmailEntry: 'myruntrip@gmail.com'
            };
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.publicMessages.length).toBe(2);
            scope.sendMessage(discussion);
            expect(scope.publicMessages.length).toBe(2);
            expect(scope.messageFilter).toBeTruthy();
            scope.resetFilterMsg();
            expect(scope.publicMessages.length).toBe(2);
            expect(scope.messageFilter).toBeFalsy();
        });

        it ('Send an empty message in public discussion', function () {
            var discussion = {
                newMessageEntry: '',
                userEmailEntry: null
            };
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.publicMessages.length).toBe(2);
            scope.sendMessage(discussion);
            expect(scope.publicMessages.length).toBe(2);
        });

        it ('Should check the redirection to private discussion', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.redirectToPrivateDiscussion();
            expect(location.path).toHaveBeenCalledWith('/myjourney-discussion-4');
        });
    });

    describe('RunnableJourneyDetailController user not logging with various journey', function(){
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
                date_start_outward: null,
                time_start_outward: null,
                nb_space_outward: null,
                date_start_return: '2015-06-02 00:00:00',
                time_start_return: '03:00',
                nb_space_return: 4,
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
                nb_place_outward: null,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 4
            },
            {
                id: 2,
                nb_place_outward: null,
                nb_place_return: 1,
                UserId: 1,
                JourneyId: 4
            }]);
            $httpBackend.whenGET('/api/user/me').respond(401);
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(401);
            $httpBackend.whenGET('/api/discussion/public/messages/4').respond([{
                id: 4,
                message: 'test à la con',
                is_public: true,
                UserId: 2,
                JourneyId: 2,
                createdAt: '2015-01-28 09:57:02'
            },{
                id: 5,
                message: 'je sais que ça va marcher',
                is_public: true,
                UserId: 1,
                JourneyId: 2,
                createdAt: '2015-01-28 11:29:13'
            }]);

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
            expect(scope.reserved_outward).toBe(0);
            expect(scope.reserved_return).toBe(3);
        });

        it ('Count free space for outward', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.reserved_outward).toBe(0);
            expect(scope.reserved_return).toBe(3);
            expect(scope.nbFreeSpaceOutward()).toBe(0);
        });

        it ('Count free space for return', function () {
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.reserved_outward).toBe(0);
            expect(scope.reserved_return).toBe(3);
            expect(scope.nbFreeSpaceReturn()).toBe(1);
        });

        it ('Show join form', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Journey');
            expect(scope.journeyId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            scope.startCheckout();
            expect(location.path).toHaveBeenCalledWith('/checkout-4');
        });
    });

    describe('RunnableJourneyDetailController with journey canceled', function(){
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
            $httpBackend.whenGET('/api/discussion/public/messages/4').respond([{
                id: 4,
                message: 'test à la con',
                is_public: true,
                UserId: 2,
                JourneyId: 2,
                createdAt: '2015-01-28 09:57:02'
            },{
                id: 5,
                message: 'je sais que ça va marcher',
                is_public: true,
                UserId: 1,
                JourneyId: 2,
                createdAt: '2015-01-28 11:29:13'
            }]);

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
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(3);
            expect(scope.reserved_return).toBe(2);
        });
    });
});