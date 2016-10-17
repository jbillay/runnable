'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableMyJourneyController', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $timeout, $location, $controller, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            service = Session;
            location = $location;
            var ret4 = {
                    outward: 1,
                    return: 1
                },
                ret5 = {
                    outward: 2,
                    return: 3
                };
            $httpBackend.whenGET('/api/journey/book/4').respond(ret4);
            $httpBackend.whenGET('/api/journey/book/5').respond(ret5);
            $httpBackend.whenGET('/api/user/journeys').respond([{
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
                is_canceled: false,
                RunId: 4,
                UserId: 1,
                Run: {
                    name: 'Maxicross'
                }
            }, {
                id: 5,
                address_start: 'Toulon, Paris',
                distance: '276 km',
                duration: '2 heures 10 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-06-25 00:00:00',
                time_start_outward: '09:00',
                nb_space_outward: 4,
                date_start_return: '2015-06-26 00:00:00',
                time_start_return: '11:00',
                nb_space_return: 3,
                car_type: 'citadine',
                amount: 32,
                is_canceled: false,
                RunId: 7,
                UserId: 1,
                Run: {
                    name: 'Les templiers'
                }
            }]);
            $httpBackend.whenGET('/api/user/joins').respond([{
                id: 1,
                nb_place_outward: 2,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 1,
                Journey: {
                    id: 1,
                    date_start_outward: '2015-06-24 00:00:00',
                    date_start_return: '2015-06-26 00:00:00',
                    Run: {
                        name: 'Maxicross'
                    }
                },
                ValidationJourney: {
                    UserId: 1
                }
            }, {
                id: 2,
                nb_place_outward: 3,
                nb_place_return: 1,
                UserId: 1,
                JourneyId: 2,
                Journey: {
                    id: 2,
                    date_start_outward: '2015-06-28 00:00:00',
                    date_start_return: '2015-06-26 00:00:00',
                    Run: {
                        name: 'Les templiers'
                    }
                },
                ValidationJourney: {}
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
            $httpBackend.whenGET('/api/discussion/users/4').respond([{
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'St Germain',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                itra: null,
                isActive: 1,
                role: 'admin',
                picture: null
            },{
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: null
            }]);
            $httpBackend.whenGET('/api/discussion/private/messages/4').respond([{
                id: 1,
                message: 'test à la con',
                UserId: 2,
                JourneyId: 4,
                createdAt: '2015-01-28 09:57:02'
            },{
                id: 2,
                message: 'je sais que ça va marcher',
                UserId: 1,
                JourneyId: 4,
                createdAt: '2015-01-28 11:29:13'
            }]);
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenPOST('/api/validation').respond({msg: 'journeyValidationDone', type: 'success'});

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableMyJourneyController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.userJourney.length).toBe(2);
            expect(scope.userJoin.length).toBe(2);
            expect(scope.userJourney[0].nb_free_place_outward).toBe(0);
            expect(scope.userJourney[0].nb_free_place_return).toBe(0);
            expect(scope.userJoin[0].validated).toBeTruthy();
            var ds = '2015-06-26 00:00:00'.split(/[- :]/);
            var dateToCheck = new Date(ds[0], ds[1]-1, ds[2], ds[3], ds[4], ds[5]).getTime();
            expect(scope.userJoin[0].Journey.date_max).toBe(dateToCheck);
        });

        it ('Validate journey', function () {
            var join = {
                id: 1,
                nb_place_outward: 2,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 1,
                Journey: {
                    date_start_outward: '2015-06-24 00:00:00',
                    date_start_return: '2015-06-26 00:00:00'
                },
                ValidationJourney: {
                    UserId: 1
                }
            },
            validationForm = {
                commentDriver: 'Good',
                commentService: 'Very good',
                rate_driver: '4',
                rate_service: '5'
            };
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.showJourneyValidationModal(join);
            expect(scope.vadidationJoin).toEqual(join);
            scope.sendValidation(validationForm);
            $httpBackend.flush();
        });

        it ('Show journey detail with join', function () {
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.showJourneyModal(scope.userJourney[0], scope.userJoin[0]);
            $httpBackend.flush();
            expect(scope.selectedJourney).toEqual(scope.userJourney[0]);
            expect(scope.selectedJoin).toEqual(scope.userJoin[0]);
            expect(scope.discussionUsers.length).toBe(2);
            expect(scope.discussionMessages.length).toBe(2);
        });

        it ('Show journey detail without join', function () {
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.showJourneyModal(scope.userJourney[0]);
            $httpBackend.flush();
            expect(scope.selectedJourney).toEqual(scope.userJourney[0]);
            expect(scope.selectedJoin).toBeNull();
            expect(scope.discussionUsers.length).toBe(2);
            expect(scope.discussionMessages.length).toBe(2);
        });

        it ('Validation Journey Cancel From My Journey', function () {
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.askValidationJourneyCancelFromMyJourney(scope.userJourney[0], 0);
            expect(scope.cancelJourney).toEqual(scope.userJourney[0]);
            expect(scope.indexToBeRemoved).toBe(0);
            expect(scope.validationMessage).toContain('Vous souhaitez annuler votre voyage pour cette course.');
            expect(angular.isFunction(scope.validationCallback)).toBeTruthy();
            scope.confirmValidationJourneyCancel();
            expect(scope.userJourney.length).toBe(1);
        });

        it ('Validation Join Cancel From My Journey', function () {
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.askValidationJoinCancelFromMyJourney(scope.userJoin[0], 0);
            expect(scope.cancelJoin).toEqual(scope.userJoin[0]);
            expect(scope.indexToBeRemoved).toBe(0);
            expect(scope.validationMessage).toContain('Vous souhaitez annuler votre participation à ce voyage.');
            expect(angular.isFunction(scope.validationCallback)).toBeTruthy();
            scope.confirmValidationJoinCancel();
            expect(scope.userJoin.length).toBe(1);
        });

        it ('Cancel ask for Validation Journey Cancel From My Journey', function () {
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.askValidationJourneyCancelFromMyJourney(scope.userJourney[0], 0);
            expect(scope.cancelJourney).toEqual(scope.userJourney[0]);
            expect(scope.indexToBeRemoved).toBe(0);
            expect(scope.validationMessage).toContain('Vous souhaitez annuler votre voyage pour cette course.');
            expect(angular.isFunction(scope.validationCallback)).toBeTruthy();
            scope.cancelValidation();
        });

        it ('Send new message for the Journey', function () {
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.showJourneyModal(scope.userJourney[0]);
            $httpBackend.flush();
            expect(scope.selectedJourney).toEqual(scope.userJourney[0]);
            expect(scope.selectedJoin).toBeNull();
            expect(scope.discussionUsers.length).toBe(2);
            expect(scope.discussionMessages.length).toBe(2);
            scope.newMessageEntry = 'Bonjour à tous';
            scope.sendMessage();
            expect(scope.discussionMessages.length).toBe(3);
        });

        it ('Should check the redirection to private discussion', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('MyJourney');
            $httpBackend.flush();
            timeout.flush();
            scope.redirectToPrivateDiscussion(4);
            expect(location.path).toHaveBeenCalledWith('/myjourney-discussion-4');
        });
    });
});
