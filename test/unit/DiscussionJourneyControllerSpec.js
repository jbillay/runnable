'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableDiscussionJourneyController not authenticated user', function(){
        var scope, rootScope, ctrlMain, ctrl, location, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            location = $location;
            scope = _$rootScope_.$new();
            spyOn(location, 'path').and.callFake(function() { return true; });
            ctrl = $controller('RunnableDiscussionJourneyController', {$rootScope: rootScope, $scope: scope, $location: location});
        }));

        it ('Start controller', function () {
            expect(location.path).toHaveBeenCalledWith('/connect');
        });
    });

    describe('RunnableDiscussionJourneyController authenticated user', function(){
        var scope, rootScope, ctrlMain, ctrl, location, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            location = $location;
            scope = _$rootScope_.$new();
            $routeParams.journeyId = 4;
            spyOn(location, 'path').and.callFake(function() { return true; });

            $httpBackend.whenGET('/api/user/me').respond({id: 1, firstname: 'Jeremy', lastname: 'Billay', address: 'Saint-Germain-en-Laye', phone: '0689876547', email: 'jbillay@gmail.com', itra: null, isActive: 1, role: 'admin', picture: null});
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenGET('/api/discussion/users/4').respond([{ id: 1, firstname: 'Jeremy', lastname: 'Billay', address: 'St Germain', phone: '0689876547', email: 'jbillay@gmail.com', itra: null, isActive: 1, role: 'admin', picture: null },{ id: 2, firstname: 'Richard', lastname: 'Couret', address: 'Bouffemont', phone: '0689876547', email: 'richard.couret@free.fr', itra: '?id=84500&nom=COURET#tab', isActive: 0, role: 'editor', picture: null }]);
            $httpBackend.whenGET('/api/discussion/private/messages/4').respond([{ id: 1, message: 'test à la con', UserId: 2, JourneyId: 4, createdAt: '2015-01-28 09:57:02' },{ id: 2, message: 'je sais que ça va marcher', UserId: 1, JourneyId: 4, createdAt: '2015-01-28 11:29:13' }]);
            $httpBackend.whenGET('/api/journey/4').respond({ id: 4, address_start: 'Nantes, France', distance: '754 km', duration: '6 heures 36 minute', journey_type: 'aller', date_start_outward: null, time_start_outward: null, nb_space_outward: null, date_start_return: '2015-06-02 00:00:00', time_start_return: '03:00', nb_space_return: 4, car_type: 'citadine', amount: 32, is_canceled: false, updatedAt: '2014-12-22 13:41:38', RunId: 2, UserId: 1, Run: { name: 'maxicross', address_start: 'Paris, France' } });
            $httpBackend.whenPOST('/api/discussion/private/message').respond({msg: 'toto', type:'success'});


            ctrlMain = $controller('RunnableMainController', {$scope: scope, $rootScope: rootScope});
            rootScope.isAuthenticated = true;
            ctrl = $controller('RunnableDiscussionJourneyController', {$rootScope: rootScope, $scope: scope, $location: location});
        }));

        it ('Start controller', function () {
            $httpBackend.flush();
            expect(scope.journeyId).toBe(4);
        });

        it ('Launch returnToOrigin', function () {
            $httpBackend.flush();
            expect(scope.journeyId).toBe(4);
            scope.returnToOrigin(4);
            expect(location.path).toHaveBeenCalledWith('/journey-4');
        });

        it ('Should check send message', function () {
            $httpBackend.flush();
            expect(scope.journeyId).toBe(4);
            expect(scope.discussionMessages.length).toBe(2);
            scope.newMessageEntry = 'TOTO';
            scope.sendMessage();
            $httpBackend.flush();
            expect(scope.discussionMessages.length).toBe(3);
            expect(scope.newMessageEntry).toBe('');

        });
    });
});