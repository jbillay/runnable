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
    });
});