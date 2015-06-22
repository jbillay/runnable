'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableUserInboxController', function() {
        var scope, rootScope, timeout, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, $timeout, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $httpBackend.whenGET('/api/inbox/msg').respond([{
                id: 1,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'test à la con',
                is_read: 1,
                UserId: 2,
                createdAt: '2015-01-28 09:57:02'
            }, {
                id: 2,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'Richard Couret dit : je sais que ça va marcher',
                is_read: 0,
                UserId: 1,
                createdAt: '2015-01-28 09:57:02'
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

            ctrlMain = $controller('RunnableMainController', {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableUserInboxController', {$rootScope: rootScope, $scope: scope});
        }));

        it('Start controller', function () {
            expect(scope.selectedMessage).toEqual('Pas de message sélectionné');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.inboxMessages.length).toBe(2);
        });

        it('Show message already read', function () {
            expect(scope.selectedMessage).toEqual('Pas de message sélectionné');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.inboxMessages.length).toBe(2);
            scope.showMessage(scope.inboxMessages[0], 0);
            expect(scope.selectedIndex).toBe(0);
            expect(scope.selectedMessage.message).toEqual('test à la con');
        });

        it('Show message not already read', function () {
            expect(scope.selectedMessage).toEqual('Pas de message sélectionné');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.inboxMessages.length).toBe(2);
            scope.showMessage(scope.inboxMessages[1], 1);
            expect(scope.selectedIndex).toBe(1);
            expect(scope.selectedMessage.message).toEqual('Richard Couret dit : je sais que ça va marcher');
        });

        it('Remove message', function () {
            expect(scope.selectedMessage).toEqual('Pas de message sélectionné');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.inboxMessages.length).toBe(2);
            scope.showMessage(scope.inboxMessages[0], 0);
            expect(scope.selectedIndex).toBe(0);
            expect(scope.selectedMessage.message).toEqual('test à la con');
            scope.removeMessage(scope.inboxMessages, 0);
            expect(scope.selectedMessage).toEqual('Pas de message sélectionné');
            expect(scope.inboxMessages.length).toBe(1);
        });

    });
});