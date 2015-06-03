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
            var promise = service.getList(),
                msgList = null;

            promise.then(function(ret){
                msgList = ret;
            });
            $httpBackend.flush();
            expect(msgList instanceof Array).toBeTruthy();
            expect(msgList.length).toBe(2);
            expect(msgList[1].id).toBe(2);
            expect(msgList[1].message).toEqual('Richard Couret dit : je sais que ça va marcher');
            expect(msgList[1].title).toEqual('Nouveau message concernant le trajet pour la course Les templiers');

        });

        it('should fail to get list of user message', function() {
            $httpBackend.whenGET('/api/inbox/msg').respond(500);
            var promise = service.getList(),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get a message', function() {
            $httpBackend.whenGET('/api/inbox/msg/2').respond({
                id: 2,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'Richard Couret dit : je sais que ça va marcher',
                is_read: 0,
                UserId: 1,
                createdAt: '2015-01-28 09:57:02'
            });
            var promise = service.getMessage(2),
                msg = null;

            promise.then(function(ret){
                msg = ret;
            });
            $httpBackend.flush();
            expect(msg.id).toBe(2);
            expect(msg.message).toEqual('Richard Couret dit : je sais que ça va marcher');
            expect(msg.title).toEqual('Nouveau message concernant le trajet pour la course Les templiers');

        });

        it('should fail to get list of user message', function() {
            $httpBackend.whenGET('/api/inbox/msg/2').respond(500);
            var promise = service.getMessage(2),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should set messasge as read', function() {
            $httpBackend.whenPOST('/api/inbox/msg/read').respond('messageRead');
            var promise = service.setAsRead(1),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message).toEqual('messageRead');

        });

        it('should fail to set messasge as read', function() {
            $httpBackend.whenPOST('/api/inbox/msg/read').respond(500);
            var promise = service.setAsRead(1),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should delete a messasge', function() {
            $httpBackend.whenPOST('/api/inbox/msg/delete').respond('messageDeleted');
            var promise = service.deleteMessage(1),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message).toEqual('messageDeleted');

        });

        it('should fail to delete a messasge', function() {
            $httpBackend.whenPOST('/api/inbox/msg/delete').respond(500);
            var promise = service.deleteMessage(1),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get number of unread message', function() {
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 3);
            var promise = service.nbUnreadMessage(),
                nb = null;

            promise.then(function(ret){
                nb = ret;
            });
            $httpBackend.flush();
            expect(nb).toBe(3);

        });

        it('should fail to get list of user message', function() {
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(500);
            var promise = service.nbUnreadMessage(),
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