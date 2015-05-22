/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('fileReader Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('fileReader Service', function() {

        beforeEach(inject(function(fileReader, _$httpBackend_, $rootScope){
            service = fileReader;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of fileReader', function() {
            expect(service).toBeDefined();
        });
    });
});