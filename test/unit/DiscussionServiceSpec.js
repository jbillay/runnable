/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Discussion Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Discussion Service', function() {

        beforeEach(inject(function(Discussion, _$httpBackend_, $rootScope){
            service = Discussion;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Discussion', function() {
            expect(service).toBeDefined();
        });

        it('should get users of discussion 2', function() {
            $httpBackend.whenGET('/api/discussion/users/2').respond([{
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'St Germain',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                itra: null,
                isActive: 1,
                role: 'admin',
                picture: null
            },{
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
            }]);
            var promise = service.getUsers(2),
                userList = null;

            promise.then(function(ret){
                userList = ret;
            });
            $httpBackend.flush();
            expect(userList instanceof Array).toBeTruthy();
            expect(userList.length).toEqual(2);
            expect(userList[1].id).toEqual(2);
            expect(userList[1].firstname).toEqual('Richard');
            expect(userList[1].lastname).toEqual('Couret');
            expect(userList[1].address).toEqual('Bouffemont');
            expect(userList[1].phone).toEqual('0689876547');
            expect(userList[1].email).toEqual('richard.couret@free.fr');
            expect(userList[1].itra).toEqual('?id=84500&nom=COURET#tab');
            expect(userList[1].isActive).toBe(0);
            expect(userList[1].role).toEqual('editor');
            expect(userList[1].picture).toBe(null);
        });

        it('should fail to get users of discussion 2', function() {
            $httpBackend.whenGET('/api/discussion/users/2').respond(500);
            var promise = service.getUsers(2),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get messages of discussion 2', function() {
            $httpBackend.whenGET('/api/discussion/messages/2').respond([{
                id: 1,
                message: 'test à la con',
                UserId: 2,
                JourneyId: 2,
                createdAt: '2015-01-28 09:57:02'
            },{
                id: 2,
                message: 'je sais que ça va marcher',
                UserId: 1,
                JourneyId: 2,
                createdAt: '2015-01-28 11:29:13'
            }]);
            var promise = service.getMessages(2),
                msgList = null;

            promise.then(function(ret){
                msgList = ret;
            });
            $httpBackend.flush();
            expect(msgList instanceof Array).toBeTruthy();
            expect(msgList.length).toEqual(2);
            expect(msgList[1].id).toEqual(2);
            expect(msgList[1].message).toEqual('je sais que ça va marcher');
            expect(msgList[1].UserId).toBe(1);
            expect(msgList[1].JourneyId).toBe(2);
        });

        it('should fail to get messages of discussion 2', function() {
            $httpBackend.whenGET('/api/discussion/messages/2').respond(500);
            var promise = service.getMessages(2),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should add a message', function () {
            $httpBackend.whenPOST('/api/discussion/message').respond('ok');

            var JourneyId = 1,
                msg = 'Test',
                message = null;

            var promise = service.addMessage(msg, JourneyId);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('ok');
        });

        it('should failed to add a message', function () {
            $httpBackend.whenPOST('/api/discussion/message').respond(500);

            var JourneyId = 1,
                msg = 'Test',
                message = null;

            var promise = service.addMessage(msg, JourneyId);

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