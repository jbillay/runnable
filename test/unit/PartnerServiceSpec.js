/**
 * Created by jeremy on 18/12/2015.
 */

'use strict';

describe('Partner Services', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Partner Services', function() {

        beforeEach(inject(function(Partner, _$httpBackend_, $rootScope){
            service = Partner;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));


        it('check the existence of Partner', function() {
            expect(service).toBeDefined();
        });

        var partnerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNjcsImV4cCI6MTIwNTA5NDE5NzR9.fikQ6L2eYUBujEeV-OYMFfX_pER5eC2Z_nQJ0YVyb9w';

        it('should get partner by token', function() {
            $httpBackend.whenGET('/api/admin/partner/' + partnerToken)
                .respond({msg: {
                        id: 2,
                        name: 'I-Run',
                        token: partnerToken,
                        expiry: '2017-07-09',
                        fee: 8.2
                    }, type: 'success'});
            var promise = service.getByToken(partnerToken),
                partner = null;

            promise.then(function(ret){
                partner = ret;
            });
            $httpBackend.flush();
            expect(partner.id).toEqual(2);
            expect(partner.name).toEqual('I-Run');
            expect(partner.token).toEqual(partnerToken);
            expect(partner.fee).toEqual(8.2);
        });

        it('should fail to get partner by token', function() {
            $httpBackend.whenGET('/api/admin/partner/' + partnerToken).respond(500);
            var promise = service.getByToken(partnerToken),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get partner list', function() {
            $httpBackend.whenGET('/api/admin/partners').respond({msg: [
                { id: 1, name: 'TCC', token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNDgsImV4cCI6MTIwNTA5NjA2NjF9.-vmI9gHnCFX30N2oVhQLiADX-Uz2XHzrHjWjJpvSERo',expiry: '2016-03-09', fee: 6.8 },
                { id: 2, name: 'I-Run', token: partnerToken, expiry: '2017-07-09', fee: 8.2 }
            ], type: 'success'});
            var promise = service.getList(),
                partners = null;

            promise.then(function(ret){
                partners = ret;
            });
            $httpBackend.flush();
            expect(partners instanceof Array).toBeTruthy();
            expect(partners.length).toBe(2);
            expect(partners[1]).toEqual({ id: 2, name: 'I-Run', token: partnerToken, expiry: '2017-07-09', fee: 8.2 });

        });

        it('should fail to get partners list', function() {
            $httpBackend.whenGET('/api/admin/partners').respond(500);
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

        it('should create new partner', function() {
            $httpBackend.whenPOST('/api/admin/partner').respond({msg: { id: 3, name: 'TOTO', token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNDgsImV4cCI6MTIwNTA5NjA2NjF9.-vmI9gHnCFX30N2oVhQLiADX-Uz2XHzrHjWjJpvSERo', expiry: '2016-03-09', fee: 5.3 }, type: 'success'});
            var newPartner = { name: 'TOTO', expiry: '2016-03-09', fee: 5.3 },
                promise = service.create(newPartner),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.id).toEqual(3);
            expect(message.name).toEqual('TOTO');
            expect(message.fee).toEqual(5.3);

        });

        it('should fail to save new page', function() {
            $httpBackend.whenPOST('/api/admin/partner').respond(500);
            var newPartner = { name: 'TOTO', expiry: '2016-03-09', fee: 5.3 },
                promise = service.create(newPartner),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should send information to partner', function() {
            $httpBackend.whenPOST('/api/admin/partner/info')
                .respond({msg: 'Partner info sent', type: 'success'});
            var promise = service.sendInfo(1),
                msg = null;

            promise.then(function(ret){
                msg = ret;
            });
            $httpBackend.flush();
            expect(msg).toEqual('Partner info sent');
        });
    });
});
