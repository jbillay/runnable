'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableInvoiceController', function() {
        var scope, rootScope, timeout, ctrl, ctrlMain, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, $timeout, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            $httpBackend.whenGET('/api/invoice').respond([
                {
                    id: 1,
                    status: 'completed',
                    amount: 108.27,
                    fees: 8.27,
                    ref: 'MRT20150217LA6E9',
                    transaction: '',
                    UserId: 1,
                    JourneyId: 1,
                    JoinId: 1
                }
            ]);
            $httpBackend.whenGET('/api/invoice/driver').respond([
                {
                    id: 1,
                    status: 'completed',
                    amount: 108.27,
                    fees: 8.27,
                    ref: 'MRT20150217LA6E9',
                    transaction: '',
                    UserId: 1,
                    JourneyId: 1,
                    JoinId: 1
                }
            ]);
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
            ctrl = $controller('RunnableInvoiceController', {$rootScope: rootScope, $scope: scope});
        }));

        it('Start controller', function () {
            $httpBackend.flush();
            timeout.flush();
            expect(scope.invoicesUser.length).toBe(1);
            expect(scope.invoicesUser[0].ref).toEqual('MRT20150217LA6E9');
            expect(scope.invoicesDriver.length).toBe(1);
            expect(scope.invoicesDriver[0].ref).toEqual('MRT20150217LA6E9');
        });
    });
});