/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Inbox Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Inbox Service', function() {

        beforeEach(inject(function(Inbox, _$httpBackend_, $rootScope){
            service = Inbox;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Inbox', function() {
            expect(service).toBeDefined();
        });

        it('should add a message in user inbox', function() {
            $httpBackend.whenPOST('/api/inbox/msg').respond({
                id: 1,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'test à la con',
                is_read: 1,
                UserId: 2,
                createdAt: '2015-01-28 09:57:02'
            });
            var promise = service.addMessage('JourneyCancel', {runName: 'test'}, 1),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.id).toBe(1);
            expect(message.title).toEqual('Nouveau message concernant le trajet pour la course Les templiers');
            expect(message.message).toEqual('test à la con');

        });

        it('should fail to add a message in user inbox', function() {
            $httpBackend.whenPOST('/api/inbox/msg').respond(500);
            var promise = service.addMessage('JourneyCancel', {runName: 'test'}, 1),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get list of user message', function() {
            $httpBackend.whenPOST('/api/inbox/msg').respond({
                id: 1,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'test à la con',
                is_read: 1,
                UserId: 2,
                createdAt: '2015-01-28 09:57:02'
            });
            var promise = service.addMessage('JourneyCancel', {runName: 'test'}, 1),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.id).toBe(1);
            expect(message.title).toEqual('Nouveau message concernant le trajet pour la course Les templiers');
            expect(message.message).toEqual('test à la con');

        });

        it('should fail to get list of user message', function() {
            $httpBackend.whenPOST('/api/inbox/msg').respond(500);
            var promise = service.addMessage('JourneyCancel', {runName: 'test'}, 1),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });
    });
});