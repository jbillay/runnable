'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableCalendarController', function() {
        var scope, rootScope, timeout, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, $timeout, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $httpBackend.whenGET('/api/participate/user/list').respond([{
                id: 1,
                Run: {
                    name: 'Les templiers'
                },
                RunId: 1,
                UserId: 1
            },{
                id: 2,
                Run: {
                    name: 'Maxicross'
                },
                RunId: 4,
                UserId: 1
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
            ctrl = $controller('RunnableCalendarController', {$rootScope: rootScope, $scope: scope});
        }));

        it('Start controller', function () {
            expect(scope.events.length).toBe(0);
            expect(scope.uiConfig.calendar.height).toBe(450);
            expect(scope.uiConfig.calendar.editable).toBeTruthy();
            expect(scope.uiConfig.calendar.header.left).toEqual('title');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.runParticpateList.length).toBe(2);
            expect(scope.events.length).toBe(2);
        });
    });
});