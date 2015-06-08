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

    describe('Test Run', function() {
        it('should load a page with authentification check', function() {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenGET('/api/user/me').respond({
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: null
            });
            $httpBackend.whenGET('partials/profile').respond({});
            location.path('/profile');
            rootScope.$digest();
            $httpBackend.flush();
            expect(route.current.controller).toBe('RunnableProfileController');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should load a page with authentification but user not authenticated', function() {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenGET('/api/user/me').respond({});
            $httpBackend.whenGET('partials/profile').respond({});
            $httpBackend.whenGET('partials/index').respond({});
            location.path('/profile');
            rootScope.$digest();
            $httpBackend.flush();
            expect(route.current.controller).toBe('RunnableIndexController');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should load a page with admin authentification check', function() {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenGET('/api/user/me').respond({
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: null
            });
            $httpBackend.whenGET('partials/admin').respond({});
            $httpBackend.whenGET('partials/index').respond({});
            location.path('/admin');
            rootScope.$digest();
            $httpBackend.flush();
            expect(route.current.controller).toBe('RunnableIndexController');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should fail to load a page with authentification check', function() {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenGET('/api/user/me').respond(500);
            $httpBackend.whenGET('partials/profile').respond({});
            $httpBackend.whenGET('partials/index').respond({});
            location.path('/profile');
            rootScope.$digest();
            $httpBackend.flush();
            expect(route.current.controller).toBe('RunnableIndexController');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });
    });
});