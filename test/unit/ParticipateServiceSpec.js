/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Participate Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Participate Service', function() {

        beforeEach(inject(function(Participate, _$httpBackend_, $rootScope){
            service = Participate;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Participate', function() {
            expect(service).toBeDefined();
        });

        it('should add a participation', function () {
            $httpBackend.whenPOST('/api/participate/add').respond('addParticipate');

            var runId = 1,
                message = null;

            var promise = service.add(runId);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('addParticipate');
        });

        it('should failed to add a participation', function () {
            $httpBackend.whenPOST('/api/participate/add').respond(500);

            var runId = 1,
                message = null;

            var promise = service.add(runId);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get user list of participate run', function() {
            $httpBackend.whenGET('/api/participate/user/list').respond([{
                id: 1,
                RunId: 1,
                UserId: 1
            },{
                id: 2,
                RunId: 4,
                UserId: 1
            }]);
            var promise = service.userList(),
                participationList = null;

            promise.then(function(ret){
                participationList = ret;
            });
            $httpBackend.flush();
            expect(participationList instanceof Array).toBeTruthy();
            expect(participationList.length).toBe(2);
            expect(participationList[1].id).toBe(2);
            expect(participationList[1].RunId).toBe(4);
            expect(participationList[1].UserId).toBe(1);
        });

        it('should fail to get user list of participate run', function() {
            $httpBackend.whenGET('/api/participate/user/list').respond(500);
            var promise = service.userList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get user list of a run', function() {
            $httpBackend.whenGET('/api/participate/run/user/list/5').respond([{
                id: 4,
                RunId: 5,
                UserId: 1
            },{
                id: 5,
                RunId: 5,
                UserId: 2
            }]);
            var promise = service.userRunList(5),
                participationList = null;

            promise.then(function(ret){
                participationList = ret;
            });
            $httpBackend.flush();
            expect(participationList instanceof Array).toBeTruthy();
            expect(participationList.length).toBe(2);
            expect(participationList[1].id).toBe(5);
            expect(participationList[1].RunId).toBe(5);
            expect(participationList[1].UserId).toBe(2);
        });

        it('should fail to get user list of a run', function() {
            $httpBackend.whenGET('/api/participate/run/user/list/5').respond(500);
            var promise = service.userRunList(5),
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