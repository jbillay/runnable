'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableUserPublicProfileController', function() {
        var scope, rootScope, timeout, service, location, ctrl, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, $timeout, $location, $controller, $routeParams) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $routeParams.userId = 1;
            $httpBackend.whenGET('/api/user/public/info/1').respond({
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'Saint-germain-en-laye, France',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                isActive: 1,
                role: 'admin',
                createdAt: '2015-06-01 00:00:00',
                Journeys: [
                    { id: 1 }
                ],
                Participates: [
                    { id: 1 }
                ],
                Joins: [
                    { id: 1 }
                ]
            });
            $httpBackend.whenGET('/api/user/public/driver/1').respond([{
                id: 1,
                comment_driver: 'Conducteur moyen',
                comment_service: 'Myruntrip est vraiment un service de qualité. Merci pour tout votre travail',
                rate_driver: 2,
                rate_service: 5,
                JoinId: 4,
                UserId: 1
            }, {
                id: 2,
                comment_driver: 'Conducteur moyen',
                comment_service: 'Myruntrip est vraiment un service de qualité. Merci pour tout votre travail',
                rate_driver: 4,
                rate_service: 5,
                JoinId: 6,
                UserId: 1
            }]);

            ctrl = $controller('RunnableUserPublicProfileController', {$rootScope: rootScope, $scope: scope});
        }));

        it('Start controller', function () {
            expect(scope.userId).toBe(1);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.userPublicInfo.firstname).toEqual('Jeremy');
            expect(scope.userPublicInfo.lastname).toEqual('Billay');
            expect(scope.userPublicInfo.email).toEqual('jbillay@gmail.com');
            expect(scope.userPublicInfo.Journeys.length).toBe(1);
            expect(scope.userPublicInfo.Joins.length).toBe(1);
            expect(scope.userPublicInfo.Participates.length).toBe(1);
            expect(scope.userDriverPublicInfo.length).toBe(2);
            expect(scope.driverRate).toBe(3);
            expect(scope.driverComments.length).toBe(2);
            // TODO: Check since creation when date could be faked
            //expect(scope.sinceCreation).toBe(1);
            expect(scope.userNbJoin).toBe(1);
            expect(scope.userNbJourney).toBe(1);
        });
    });
});