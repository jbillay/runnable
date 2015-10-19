'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableConnectController', function () {
        var scope, rootScope, ctrl, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, _$rootScope_, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();

            ctrl = $controller('RunnableConnectController',
                {$scope: scope, $rootScope: rootScope});
        }));

        it('Start controller', function () {
        });

    });
});