/**
 * Created by jeremy on 04/05/2016.
 */
'use strict';
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableCheckoutController user authorized', function(){
        var scope, rootScope, timeout, service, routeParams, location, ctrl, ctrlMain, $httpBackend, q, sce, USER_MSG;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, _$q_, _$sce_, $controller, $compile, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            routeParams = $routeParams;
            routeParams.journeyId = 4;
            service = Session;
            location = $location;
            q = _$q_;
            sce = _$sce_;

            spyOn(rootScope, '$broadcast').and.callThrough();
            USER_MSG = {
                passwordReseted:	    'Un nouveau mot de passe vient de vous être envoyé',
                runCreated:             'La course a bien été créée',
                infoRequestReceived:    'Nous avons bien reçu votre demande d\'information, nous revenons vers vous rapidement'
            };

            $httpBackend.whenGET('/api/user/me').respond({
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
            });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenGET('/api/fee/4')
                .respond({msg: {
                    percentage: 0.18,
                    value: 2,
                    discount: 0.2
                }, type: 'success'});
            $httpBackend.whenGET('/api/journey/4').respond({
                id: 4,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 2,
                date_start_return: '2015-06-03 00:00:00',
                time_start_return: '06:00',
                nb_space_return: 3,
                car_type: 'citadine',
                amount: 32,
                is_canceled: false,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1
            });

            var formElem = angular.element('<form ng-form-commit name="form"><input type="text" name="number"></form>');
            $compile(formElem)(scope);

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            rootScope.isAuthenticated = true;
            ctrl = $controller('RunnableCheckoutController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location, $routeParams: routeParams});
        }));

        it ('Start controller on DEV environment', function () {
            $httpBackend.whenGET('/api/version').respond('DEV');
            $httpBackend.flush();
            expect(scope.selectedJourneyId).toBe(4);
        });

        it ('Start controller on non DEV environment', function () {
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.flush();
            expect(scope.selectedJourneyId).toBe(4);
        });

        it ('Calculate prices on a trip', function () {
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.flush();
            expect(scope.selectedJourneyId).toBe(4);
            scope.selectedPlaceOutward = 2;
            scope.selectedPlaceReturn = 3;
            scope.calculatePrices();
            expect(scope.journeyPrice.outwardAmount).toBe(64);
            expect(scope.journeyPrice.returnAmount).toBe(96);
            expect(scope.journeyPrice.fees).toBeCloseTo(31.05);
            expect(scope.journeyPrice.totalAmount).toBeCloseTo(191.05);
        });

        it ('Check Join Journey', function () {
            var form = scope.form;
            spyOn(form, 'commit');
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.whenPOST('/api/join').respond('userJoined');
            $httpBackend.flush();
            expect(scope.selectedJourneyId).toBe(4);
            scope.joinJourney(1, 0, form);
            $httpBackend.flush();
            expect(scope.joined).toBe(1);
            expect(scope.reserved_outward).toBe(1);
            expect(scope.reserved_return).toBe(0);
            expect(form.commit).toHaveBeenCalled();
        });

        it ('Check promo code on for a Journey', function () {
            $httpBackend.whenGET('/api/fee/check/TOTO').respond({msg: { id: 7, discount: 0.8 }, type: 'success'});
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.flush();
            scope.promoCode = {
                code: 'TOTO'
            };
            scope.checkPromoCode();
            $httpBackend.flush();
            rootScope.$digest();
            expect(scope.selectedJourneyId).toBe(4);
            expect(scope.promoCode.promoCodeValid).toBe(1);
            expect(scope.promoCode.discount).toBeCloseTo(80);
            expect(scope.discountLabel).toEqual('80 %');
        });

        it ('Check promo code less interesting than existing discount on for a Journey', function () {
            $httpBackend.whenGET('/api/fee/check/TOTO').respond({msg: { id: 7, discount: 0.1 }, type: 'success'});
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.flush();
            scope.promoCode = {
                code: 'TOTO'
            };
            scope.checkPromoCode();
            $httpBackend.flush();
            rootScope.$digest();
            expect(scope.selectedJourneyId).toBe(4);
            expect(scope.promoCode.promoCodeValid).toBe(1);
            expect(scope.promoCode.discount).toBeCloseTo(10);
            expect(scope.discount).toBeCloseTo(20);
            expect(scope.discountLabel).toEqual('20 %');
        });

        it ('Error in checking promo code on for a Journey', function () {
            $httpBackend.whenGET('/api/fee/check/TOTO').respond({msg: {}, type: 'success'});
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.flush();
            scope.promoCode = {
                code: 'TOTO'
            };
            scope.checkPromoCode();
            $httpBackend.flush();
            rootScope.$digest();
            expect(scope.selectedJourneyId).toBe(4);
            expect(scope.promoCode.promoCodeValid).toBe(0);
            expect(scope.promoCode.discount).toBeUndefined();
            expect(scope.promoCode.codeError).toBe(1);
            expect(scope.promoCode.codeErrorMsg).toEqual('Désolé mais votre code n\'existe pas ou n\'est plus valide.');
        });

        it ('Error in checking promo code on for a Journey', function () {
            $httpBackend.whenGET('/api/fee/check/TOTO').respond(500);
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.flush();
            scope.promoCode = {
                code: 'TOTO'
            };
            scope.checkPromoCode();
            $httpBackend.flush();
            rootScope.$digest();
            expect(scope.selectedJourneyId).toBe(4);
            expect(scope.promoCode.promoCodeValid).toBe(0);
            expect(scope.promoCode.discount).toBeUndefined();
            expect(scope.promoCode.codeError).toBe(1);
            expect(scope.promoCode.codeErrorMsg).toEqual('En raison d\'un problème nous pouvons pas vérifier votre code');
        });

        it ('Reset promo code on for a Journey', function () {
            $httpBackend.whenGET('/api/fee/check/TOTO').respond({msg: { id: 7, discount: 0.8 }, type: 'success'});
            $httpBackend.whenGET('/api/version').respond('TOTO');
            $httpBackend.flush();
            scope.promoCode = {
                code: 'TOTO'
            };
            scope.checkPromoCode();
            $httpBackend.flush();
            rootScope.$digest();
            expect(scope.selectedJourneyId).toBe(4);
            expect(scope.promoCode.promoCodeValid).toBe(1);
            expect(scope.promoCode.discount).toBeCloseTo(80);
            expect(scope.discountLabel).toEqual('80 %');
            scope.resetPromoCode();
            expect(scope.promoCode.promoCodeValid).toBe(0);
            expect(scope.promoCode.discount).toBe(0);
            expect(scope.discount).toBe(20);
            expect(scope.promoCode.codeError).toBe(0);
            expect(scope.promoCode.codeErrorMsg).toEqual('');
        });
    });

    describe('RunnableCheckoutController existing checkout', function(){
        var scope, rootScope, timeout, service, location, ctrl, ctrlMain, $httpBackend, q, sce, routeParams;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location, _$q_, _$sce_, $controller, $compile, Session) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            service = Session;
            location = $location;
            routeParams = $routeParams;
            routeParams.journeyId = 4;
            q = _$q_;
            sce = _$sce_;

            $httpBackend.whenGET('/api/user/me').respond({
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
            });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenGET('/api/fee/4')
                .respond({msg: {
                    percentage: 0.18,
                    value: 2,
                    discount: 0.2
                }, type: 'success'});
            $httpBackend.whenGET('/api/journey/4').respond({
                id: 4,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 2,
                date_start_return: '2015-06-03 00:00:00',
                time_start_return: '06:00',
                nb_space_return: 3,
                car_type: 'citadine',
                amount: 32,
                is_canceled: true,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1
            });

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            rootScope.isAuthenticated = true;
            ctrl = $controller('RunnableCheckoutController',
                {$rootScope: rootScope, $scope: scope, 'Session': service, $location: location, $routeParams: routeParams});
        }));

        it ('Start controller on DEV environment', function () {
            spyOn(location, 'path');
            $httpBackend.whenGET('/api/version').respond('DEV');
            $httpBackend.flush();
            rootScope.$digest();
            expect(scope.selectedJourneyId).toBe(4);
            expect(location.path).toHaveBeenCalledWith('/journey');
        });
    });
});