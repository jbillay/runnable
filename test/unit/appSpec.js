/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('testing config block', function() {
    beforeEach(module('runnable'));

    var location, route, rootScope, $httpBackend;

    beforeEach(inject(
        function( _$location_, _$route_, _$rootScope_, _$httpBackend_) {
            location = _$location_;
            route = _$route_;
            rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
        }));

    describe('Route', function() {
        it('should load the login page on successful load of /run', function() {
            $httpBackend.whenGET('/api/user/me').respond({});
            $httpBackend.whenGET('partials/run_list').respond({});
            location.path('/run');
            rootScope.$digest();
            expect(route.current.controller).toBe('RunnableRunController');
        });
    });

});