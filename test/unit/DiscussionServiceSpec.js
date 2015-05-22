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
    });
});