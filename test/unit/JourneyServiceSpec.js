/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Journey Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Journey Service', function() {

        beforeEach(inject(function(Journey, _$httpBackend_, $rootScope){
            service = Journey;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Journey', function() {
            expect(service).toBeDefined();
        });
    });
});