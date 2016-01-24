'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableSharedController', function(){
        var scope, rootScope, ctrl, service, $httpBackend, User;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $controller, Session, _User_) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            service = Session;
            User = _User_;
            ctrl = $controller('RunnableSharedController', {$scope: scope, 'Session': service});
        }));

        it ('Should send invite', function () {
            var inviteData = {
                    inviteMessage: 'J’utilise My Run Trip pour organiser mes voyages jusqu\'aux différentes courses. ' +
                    'Cela me permet de faire des économies sur tous mes trajets. ' +
                    'Rejoins moi en t’inscrivant sur http://www.myruntrip.fr pour que nous puissions organiser ensemble notre voyage ' +
                    'jusqu\'à la prochaine course.- ' + service.userFirstname,
                    inviteEmails: ''
                };
            spyOn(User, 'inviteFriends').and.callFake(function() {
                return { then: function(callback) { return callback(inviteData); } }; });
            expect(scope.invitForm.inviteMessage).toContain('J’utilise My Run Trip pour organiser mes voyages jusqu\'aux différentes courses.');
            expect(scope.invitForm.inviteEmails).toEqual('');
            scope.inviteFriends(inviteData);
            expect(inviteData.inviteEmails).toEqual('');
            expect(User.inviteFriends).toHaveBeenCalled();
        });
    });
});