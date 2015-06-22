/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('ValidationJourney Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('ValidationJourney Service', function() {

        beforeEach(inject(function(ValidationJourney, _$httpBackend_, $rootScope){
            service = ValidationJourney;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of ValidationJourney', function() {
            expect(service).toBeDefined();
        });

        it('should validate a journey', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/validation').respond({msg: 'journeyValidationDone', type: 'success'});

            var info = {
                    joinId: 1,
                    commentDriver: 'test driver',
                    commentService: 'Test service',
                    rate_driver: 2,
                    rate_service: 5
                },
                message = null;

            var promise = service.validation(info.joinId, info.commentDriver, info.commentService,
                                            info.rate_driver, info.rate_service);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('journeyValidationDone');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to validate a journey', function () {
            $httpBackend.whenPOST('/api/validation').respond(500);

            var info = {
                    joinId: 1,
                    commentDriver: 'test driver',
                    commentService: 'Test service',
                    rate_driver: 2,
                    rate_service: 5
                },
                message = null;

            var promise = service.validation(info.joinId, info.commentDriver, info.commentService,
                info.rate_driver, info.rate_service);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get user feedback', function() {
            $httpBackend.whenGET('/api/home/feedback').respond([{
                id: 1,
                comment_driver: 'Conducteur moyen',
                comment_service: 'Myruntrip est vraiment un service de qualité. Merci pour tout votre travail',
                rate_driver: 3,
                rate_service: 5,
                JoinId: 4,
                UserId: 1
            }]);
            var promise = service.userFeedback(),
                userFeedback = null;

            promise.then(function(ret){
                userFeedback = ret;
            });
            $httpBackend.flush();
            expect(userFeedback instanceof Array).toBeTruthy();
            expect(userFeedback.length).toBe(1);
            expect(userFeedback[0].id).toBe(1);
            expect(userFeedback[0].comment_driver).toEqual('Conducteur moyen');
            expect(userFeedback[0].comment_service).toEqual('Myruntrip est vraiment un service de qualité. Merci pour tout votre travail');
            expect(userFeedback[0].rate_driver).toBe(3);
            expect(userFeedback[0].rate_service).toBe(5);
        });

        it('should fail to get user feedback', function() {
            $httpBackend.whenGET('/api/home/feedback').respond(500);
            var promise = service.userFeedback(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
    });
});