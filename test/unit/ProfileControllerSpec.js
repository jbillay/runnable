'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableProfileController', function(){
        var scope, rootScope, ctrl, ctrlLogin, ctrlMain, location, sce, $httpBackend, AUTH_EVENTS;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $location, $sce, $compile, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            location = $location;
            sce = $sce;
            AUTH_EVENTS = {
                loginSuccess: 'auth-login-success',
                loginFailed: 'auth-login-failed',
                logoutSuccess: 'auth-logout-success',
                sessionTimeout: 'auth-session-timeout',
                notAuthenticated: 'auth-not-authenticated',
                notAuthorized: 'auth-not-authorized'
            };
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
            $httpBackend.whenGET('/api/user/runs').respond('HTML');
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
                picture: 'test'
            });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenGET('/api/user/bankaccount').respond(
                { id: 2, owner: 'Richard Couret', agency_name: 'CIC', IBAN: 'TESTIBAN', BIC: 'TESTBIC', UserId: 2});
            $httpBackend.whenPOST('/api/user/picture').respond({msg: 'userPictureSaved', type: 'success'});
            $httpBackend.whenGET('/api/user/remove/picture').respond({msg: 'userPictureRemoved', type: 'success'});
            $httpBackend.whenPUT('/api/user').respond({msg: 'accountUpdated', type: 'success'});
            $httpBackend.whenPOST('/api/user/bankaccount').respond({msg: 'bankAccountSaved', type: 'success'});
            $httpBackend.whenPOST('/api/user/password/update').respond({msg: 'userToggleActive', type: 'success'});

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrlLogin = $controller('RunnableLoginController',
                {$scope: scope, $rootScope: rootScope, AUTH_EVENTS: AUTH_EVENTS});
            ctrl = $controller('RunnableProfileController',
                {$scope: scope, $rootScope: rootScope, $location: location, $sce: sce});
            var formElem = angular.element('<form name="form"><input type="text" name="number"></form>');
            $compile(formElem)(scope);
        }));

        it ('Start controller', function () {
            var credentials = {
                username: 'richard.couret@free.fr',
                password: 'richard'
            };
            expect(scope.page).toEqual('Profile');
            scope.login(credentials);
            $httpBackend.flush();
        });

        it ('get a file', function () {
            // TODO: Test when readAsDataUrl has been called
            scope.getFile('.jshintrc');
            $httpBackend.flush();
        });

        it ('save a file', function () {
            scope.file = '.jshintrc';
            scope.saveFile();
            $httpBackend.flush();
        });

        it ('save without a file', function () {
            scope.saveFile();
            $httpBackend.flush();
        });

        it ('delete a file', function () {
            scope.file = '.jshintrc';
            scope.deleteFile();
            $httpBackend.flush();
        });

        it ('update user info', function () {
            var user = {
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
            };
            scope.updateUserInfo(user);
            $httpBackend.flush();
        });

        it ('Save bank info', function () {
            var account = {
                    id: 1,
                    owner: 'Jeremy Billay',
                    agency_name: 'Crédit Agricole',
                    IBAN: 'FR7618206000576025840255308',
                    BIC: 'AGRIFRPP882',
                    UserId: 1
                };
            scope.saveBankAccount(account);
            $httpBackend.flush();
        });

        it('Update password', function () {
            var form = scope.form,
                passwords= {
                    old: 'test',
                    new: 'test2'
                };
            scope.updatePassword(passwords, form);
            $httpBackend.flush();
        });

        it('Update password wihtout form', function () {
            var passwords= {
                    old: 'test',
                    new: 'test2'
                };
            scope.updatePassword(passwords, null);
            $httpBackend.flush();
        });
    });
});