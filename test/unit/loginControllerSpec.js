'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableLoginController', function(){
        var scope, rootScope, ctrl, ctrlMain, $httpBackend, AUTH_EVENTS;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            AUTH_EVENTS = {
                loginSuccess: 'auth-login-success',
                loginFailed: 'auth-login-failed',
                logoutSuccess: 'auth-logout-success',
                sessionTimeout: 'auth-session-timeout',
                notAuthenticated: 'auth-not-authenticated',
                notAuthorized: 'auth-not-authorized'
            };
            $httpBackend.whenGET('/api/user/me').respond(500);
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(500);
            $httpBackend.whenPOST('/api/user/password/reset').respond('passwordReset');
            $httpBackend.whenPOST('/api/journey/confirm').respond({msg: 'draftJourneySaved', type: 'success',
                journey: { id: 1, Run: { name: 'Maxicross' }}});

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableLoginController',
                {$scope: scope, $rootScope: rootScope, AUTH_EVENTS: AUTH_EVENTS});
        }));

        it ('Start controller', function () {
            expect(scope.credentials.username).toEqual('');
            expect(scope.credentials.password).toEqual('');
        });

        it ('Login a user with unread email', function () {
            var user = {
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'Saint Germain en laye',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                provider: 'local',
                salt: 'T75xyNJfL19hzc778A08HQ==',
                itra: null,
                isActive: 1,
                role: 'admin',
                picture: '/uploads/users/avatar_1.jpg',
                Inboxes: [{
                    id: 1,
                    title: 'Nouveau message concernant le trajet pour la course Les templiers',
                    message: 'test à la con',
                    is_read: 0
                }]
            };
            $httpBackend.whenPOST('/login').respond({msg: user, type: 'success'});
            var credentials = {
                username: 'jbillay@gmail.com',
                password: 'noofs'
            };
            expect(scope.credentials.username).toEqual('');
            expect(scope.credentials.password).toEqual('');
            scope.login(credentials);
            $httpBackend.flush();
            expect(rootScope.currentUser.email).toEqual(credentials.username);
            expect(rootScope.userUnreadEmail).toBe(1);
            expect(rootScope.isAdmin).toBeTruthy();
        });

        it ('Login a user without unread email', function () {
            var user = {
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                hashedPassword: 'qksdjlqjdlsjqls',
                provider: 'local',
                salt: 'skjdljqld',
                itra: null,
                isActive: 1,
                role: 'editor',
                picture: null,
                Inboxes: [{
                    id: 1,
                    title: 'Nouveau message concernant le trajet pour la course Les templiers',
                    message: 'test à la con',
                    is_read: 1
                }]
            };
            $httpBackend.whenPOST('/login').respond({msg: user, type: 'success'});
            var credentials = {
                username: 'richard.couret@free.fr',
                password: 'richard'
            };
            expect(scope.credentials.username).toEqual('');
            expect(scope.credentials.password).toEqual('');
            scope.login(credentials);
            $httpBackend.flush();
            expect(rootScope.currentUser.email).toEqual(credentials.username);
            expect(rootScope.userUnreadEmail).toBe(0);
            expect(rootScope.isAdmin).not.toBeTruthy();
        });

        it ('Login a user after draft journey saved', function () {
            var user = {
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                hashedPassword: 'qksdjlqjdlsjqls',
                provider: 'local',
                salt: 'skjdljqld',
                itra: null,
                isActive: 1,
                role: 'editor',
                picture: null,
                Inboxes: [{
                    id: 1,
                    title: 'Nouveau message concernant le trajet pour la course Les templiers',
                    message: 'test à la con',
                    is_read: 1
                }]
            };
            $httpBackend.whenPOST('/login').respond({msg: user, type: 'success'});
            $httpBackend.whenPOST('/api/inbox/msg').respond({
                id: 1,
                title: 'Nouveau message concernant le trajet pour la course Les templiers',
                message: 'test à la con',
                is_read: 1,
                UserId: 2,
                createdAt: '2015-01-28 09:57:02'
            });
            var credentials = {
                username: 'richard.couret@free.fr',
                password: 'richard'
            };
            rootScope.draftId = 'JNY876543';
            expect(scope.credentials.username).toEqual('');
            expect(scope.credentials.password).toEqual('');
            scope.login(credentials);
            $httpBackend.flush();
            expect(rootScope.currentUser.email).toEqual(credentials.username);
            expect(rootScope.userUnreadEmail).toBe(0);
            expect(rootScope.isAdmin).not.toBeTruthy();
        });

        it ('Reset a user account', function () {
            expect(scope.credentials.username).toEqual('');
            expect(scope.credentials.password).toEqual('');
            scope.reset('jbillay@gmail.com');
        });

        it ('Switch login to reset and back', function () {
            scope.toggleLogin();
            expect(scope.forLogin).not.toBeTruthy();
            expect(scope.forReset).toBeTruthy();
            scope.toggleLogin();
            expect(scope.forLogin).toBeTruthy();
            expect(scope.forReset).not.toBeTruthy();
        });
    });
});