/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Join Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Join Service', function() {

        beforeEach(inject(function(Join, _$httpBackend_, $rootScope){
            service = Join;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Join', function() {
            expect(service).toBeDefined();
        });

        it('should create a join', function () {
            $httpBackend.whenPOST('/api/join').respond('userJoined');

            var info = {
                    journey_id: 1,
                    nb_place_outward: 2,
                    nb_place_return: 3,
                    amount: 23,
                    fees: 4,
                    ref: 'TOTO'
                },
                message = null;

            var promise = service.add(info.journey_id, info.nb_place_outward, info.nb_place_return,
                                        info.amount, info.fees, info.ref);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('userJoined');
        });

        it('should failed to create a join', function () {
            $httpBackend.whenPOST('/api/join').respond(500);

            var info = {
                    journey_id: 1,
                    nb_place_outward: 2,
                    nb_place_return: 3,
                    amount: 23,
                    fees: 4,
                    ref: 'TOTO'
                },
                message = null;

            var promise = service.add(info.journey_id, info.nb_place_outward, info.nb_place_return,
                info.amount, info.fees, info.ref);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get list of join for a journey', function() {
            $httpBackend.whenGET('/api/join/journey/1').respond([{
                    id: 1,
                    nb_place_outward: 2,
                    nb_place_return: 2,
                    UserId: 1,
                    JourneyId: 1
                },
                {
                    id: 2,
                    nb_place_outward: 1,
                    nb_place_return: null,
                    UserId: 1,
                    JourneyId: 2
                }]);
            var promise = service.getListForJourney(1),
                listJoinJourney = null;

            promise.then(function(ret){
                listJoinJourney = ret;
            });

            $httpBackend.flush();
            expect(listJoinJourney instanceof Array).toBeTruthy();
            expect(listJoinJourney.length).toBe(2);
            expect(listJoinJourney[1].id).toBe(2);
            expect(listJoinJourney[1].nb_place_outward).toBe(1);
            expect(listJoinJourney[1].nb_place_return).toBe(null);
        });

        it('should fail to get list of join for a journey', function() {
            $httpBackend.whenGET('/api/join/journey/1').respond(500);
            var promise = service.getListForJourney(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        
        it('should get list of joins', function() {
            $httpBackend.whenGET('/api/admin/joins').respond([{
                    id: 1,
                    nb_place_outward: 2,
                    nb_place_return: 2,
                    UserId: 1,
                    JourneyId: 1
                },
                {
                    id: 2,
                    nb_place_outward: 1,
                    nb_place_return: null,
                    UserId: 1,
                    JourneyId: 2
                },
                {
                    id: 3,
                    nb_place_outward: 1,
                    nb_place_return: null,
                    UserId: 2,
                    JourneyId: 2
                }]);
            var promise = service.getList(),
                listJoins = null;

            promise.then(function(ret){
                listJoins = ret;
            });

            $httpBackend.flush();
            expect(listJoins instanceof Array).toBeTruthy();
            expect(listJoins.length).toBe(3);
            expect(listJoins[1].id).toBe(2);
            expect(listJoins[1].nb_place_outward).toBe(1);
            expect(listJoins[1].nb_place_return).toBe(null);
        });

        it('should fail to get list of joins', function() {
            $httpBackend.whenGET('/api/admin/joins').respond(500);
            var promise = service.getList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should cancel a join', function() {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenGET('/api/join/cancel/1').respond({msg: 'joinCancelled', type: 'success'});
            var promise = service.cancel(1),
                message = null;

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('joinCancelled');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should fail to cancel a join', function() {
            $httpBackend.whenGET('/api/join/cancel/1').respond(500);
            var promise = service.cancel(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get join to refund', function() {
            $httpBackend.whenGET('/api/admin/join/toRefund').respond({msg: [{id: 1}, {id: 2}], type: 'success'});
            var promise = service.toRefund(),
                joinList= null;

            promise.then(function(list){
                joinList = list;
            });

            $httpBackend.flush();
            expect(joinList.length).toBe(2);
        });

        it('should get join to refund with error', function() {
            $httpBackend.whenGET('/api/admin/join/toRefund').respond({msg: 'Mock to fail', type: 'error'});
            var promise = service.toRefund(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toBe('Mock to fail');
        });

        it('should fail to get join to refund', function() {
            $httpBackend.whenGET('/api/admin/join/toRefund').respond(500);
            var promise = service.toRefund(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        it('should refund a join', function() {
            $httpBackend.whenPOST('/api/admin/join/refund').respond({msg: {id: 2}, type: 'success'});
            var promise = service.refund(2),
                joinList= null;

            promise.then(function(list){
                joinList = list;
            });

            $httpBackend.flush();
            expect(joinList.id).toBe(2);
        });

        it('should refund a join with error', function() {
            $httpBackend.whenPOST('/api/admin/join/refund').respond({msg: 'Mock to fail', type: 'error'});
            var promise = service.refund(2),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toBe('Mock to fail');
        });

        it('should fail to get join to refund', function() {
            $httpBackend.whenPOST('/api/admin/join/refund').respond(500);
            var promise = service.refund(2),
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