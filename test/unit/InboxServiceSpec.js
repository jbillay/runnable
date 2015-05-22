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
    });
});