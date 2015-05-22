/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('GoogleMapApi Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('GoogleMapApi Service', function() {

        beforeEach(inject(function(GoogleMapApi, _$httpBackend_, $rootScope){
            service = GoogleMapApi;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of GoogleMapApi', function() {
            expect(service).toBeDefined();
        });
    });
});