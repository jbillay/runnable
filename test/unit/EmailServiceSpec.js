/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Email Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Email Service', function() {

        beforeEach(inject(function(Email, _$httpBackend_, $rootScope){
            service = Email;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Email', function() {
            expect(service).toBeDefined();
        });

        it('should send an email', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/send/mail').respond('message envoyé');

            var info = {
                    emails: 'jbillay@gmail.com',
                    message: 'Bonjour Jeremy',
                    title: 'My Run Trip Email',
                    confirm: 'message envoyé'
                },
                message = null;

            var promise = service.send(info);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('message envoyé');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to send an email', function () {
            $httpBackend.whenPOST('/api/send/mail').respond(500);

            var info = {
                    emails: 'jbillay@gmail.com',
                    message: 'Bonjour Jeremy',
                    title: 'My Run Trip Email',
                    confirm: 'message envoyé'
                },
                message = null;

            var promise = service.send(info);

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