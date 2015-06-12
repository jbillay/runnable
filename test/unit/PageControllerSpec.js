'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnablePageController', function(){
        var scope, ctrl, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            $routeParams.tag = 'test';
            scope = $rootScope.$new();
            ctrl = $controller('RunnablePageController', {$scope: scope});
        }));

        it ('Should get page test', function () {
            $httpBackend.whenGET('/api/page/test').respond({id: 1, title: 'Page de test', tag: 'test',
                content: 'HTML TEXT', is_active: true});
            expect(scope.page).toBeUndefined();
            $httpBackend.flush();

            expect(scope.page).toEqual({id: 1, title: 'Page de test', tag: 'test',
                content: 'HTML TEXT', is_active: true});
        });
    });
});