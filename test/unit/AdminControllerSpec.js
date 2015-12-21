'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableAdminController', function(){
        var scope, rootScope, ctrl, ctrlLogin, ctrlMain, location, $httpBackend, AUTH_EVENTS;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            location = $location;
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
                role: 'admin',
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
            $httpBackend.whenGET('/api/admin/users').respond([{
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
                role: 'editor',
                picture: null
            },{
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                hashedPassword: 'VMcLEoVLvXdolDlsRzF8cVjo2swFfV1Mo76ycRKObI00pVfBy73IwlYj/mX3Z+PH873k57Gu8vWCbWo9v/Cxuw==',
                provider: 'local',
                salt: 'd36OGvube+jUO8lcBpmr+Q==',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: null,
                createdAt: '2015-02-04 18:55:39',
                updatedAt: '2015-02-04 18:55:39'
            }]);
            $httpBackend.whenGET('/api/admin/runs').respond([{
                id: 1,
                name: 'Maxicross',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'Toutes les infos sur le maxicross',
                is_active: 1
            },
                {
                    id: 2,
                    name: 'Les templiers',
                    type: 'trail',
                    address_start: 'Millau, France',
                    date_start: '2015-09-15 00:00:00',
                    time_start: '06:30',
                    distances: '72km',
                    elevations: '2500+',
                    info: 'ksdjlsdjlf jsdlfjl sjdflj',
                    is_active: 1
                }]);
            $httpBackend.whenGET('/api/admin/journeys').respond([{
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-09-06 00:00:00',
                time_start_outward: '06:00',
                nb_space_outward: 2,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1
            }, {
                id: 2,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 2,
                date_start_return: null,
                time_start_return: null,
                nb_space_return: null,
                car_type: 'citadine',
                amount: 32,
                is_canceled: true,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1
            }]);
            $httpBackend.whenGET('/api/admin/joins').respond([{
                id: 1,
                nb_place_outward: 2,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 1,
                Invoice: {
                    amount: 23,
                    fees: 4,
                    status: 'completed'
                }
            },
                {
                    id: 2,
                    nb_place_outward: 1,
                    nb_place_return: null,
                    UserId: 1,
                    JourneyId: 1,
                    Invoice: {
                        amount: 12,
                        fees: 1,
                        status: 'completed'
                    }
                },
                {
                    id: 3,
                    nb_place_outward: 1,
                    nb_place_return: null,
                    UserId: 2,
                    JourneyId: 2,
                    Invoice: {
                        amount: 67,
                        fees: 12,
                        status: 'completed'
                    }
                }]);
            $httpBackend.whenGET('/api/admin/partners').respond({msg: [
                { id: 1, name: 'TCC', token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNDgsImV4cCI6MTIwNTA5NjA2NjF9.-vmI9gHnCFX30N2oVhQLiADX-Uz2XHzrHjWjJpvSERo',expiry: '2016-03-09', fee: 6.8 },
                { id: 2, name: 'I-Run', token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNjcsImV4cCI6MTIwNTA5NDE5NzR9.fikQ6L2eYUBujEeV-OYMFfX_pER5eC2Z_nQJ0YVyb9w', expiry: '2017-07-09', fee: 8.2 }
            ], type: 'success'});
            $httpBackend.whenGET('/api/admin/options').respond([
                { id: 1, name: 'emailTemplate', value: 'emailTemplateTest'},
                { id: 2, name: 'mailConfig', value: 'mailConfigTest'}
            ]);
            $httpBackend.whenGET('/api/admin/pages').respond([
                { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 },
                { id: 2, title: 'Page pour toto', tag: 'toto', content: 'ENCORE UN TEST', is_active: false }
            ]);
            $httpBackend.whenGET('/api/version').respond('DEV');
            $httpBackend.whenPOST('/api/admin/user/active').respond({msg: 'userToggleActive', type: 'success'});
            $httpBackend.whenPOST('/api/admin/options').respond({msg: 'emailOptionsSaved', type: 'success'});
            $httpBackend.whenPOST('/api/user/password/reset').respond({msg: 'passwordReset', type: 'success'});
            $httpBackend.whenPOST('/api/admin/page').respond({msg: 'pageSaved', type: 'success'});
            $httpBackend.whenPOST('/api/admin/run/active').respond({msg: 'done', type: 'success'});
            $httpBackend.whenPOST('/api/admin/partner/info').respond({msg: 'Partner info sent', type: 'success'});
            $httpBackend.whenPOST('/api/admin/partner').respond({msg: {
                UserId: 1,
                createdAt: '2015-12-21T08:37:49.000Z',
                expiry: '2015-12-25T23:00:00.000Z',
                fee: '6.9',
                id: 7,
                name: 'qsdqsdqsd',
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoicXNkcXNkcXNkIiwiaWF0IjoxNDUwNjg3MDY5fQ.BqKz4yQxEyhS_vhh0aVNH_jrTYFcH1EVmx-YojFXUHM',
                updatedAt: '2015-12-21T08:37:49.000Z'
            }, type: 'success'});
            $httpBackend.whenGET('/api/admin/user/bankaccount/1').respond(
                { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 });

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrlLogin = $controller('RunnableLoginController',
                {$scope: scope, $rootScope: rootScope, AUTH_EVENTS: AUTH_EVENTS});
            ctrl = $controller('RunnableAdminController',
                {$scope: scope, $rootScope: rootScope, $location: location});
        }));

        it ('Start controller', function () {
            var credentials = {
                username: 'richard.couret@free.fr',
                password: 'richard'
            };
            spyOn(location, 'path');
            expect(scope.page).toEqual('Admin');
            scope.login(credentials);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/');
        });

        it ('Toggle user activation', function () {
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
                    isActive: 0,
                    role: 'admin'
                },
                user2 = {
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
                    role: 'admin'
                };
            scope.userToggleActive(user);
            expect(user.isActive).toBeTruthy();
            scope.userToggleActive(user2);
            expect(user2.isActive).not.toBeTruthy();
            $httpBackend.flush();
        });

        it ('Save email options', function () {
            var emailOption = [
                    { id: 1, name: 'emailTemplate', value: 'emailTemplateTest'},
                    { id: 2, name: 'mailConfig', value: 'mailConfigTest'}
                ];
            scope.submitEmailOptions(emailOption);
            $httpBackend.flush();
        });

        it ('Cancel Journey', function () {
            var journey = {
                    id: 1,
                    address_start: 'Saint-Germain-en-Laye, France',
                    distance: '585 km',
                    duration: '5 heures 29 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-09-06 00:00:00',
                    time_start_outward: '06:00',
                    nb_space_outward: 2,
                    date_start_return: '2015-09-07 00:00:00',
                    time_start_return: '09:00',
                    nb_space_return: 3,
                    car_type: 'monospace',
                    amount: 23,
                    is_canceled: false,
                    updatedAt: '2014-12-22 09:08:16',
                    RunId: 5,
                    UserId: 1,
                    Run: {
                        name: 'Maxicross'
                    }
                },
                credentials = {
                    username: 'richard.couret@free.fr',
                    password: 'richard'
                };
            scope.login(credentials);
            $httpBackend.flush();
            scope.journeyCancel(journey);
        });

        it ('Edit Page', function () {
            var page = {
                id: 2,
                title: 'Page pour toto',
                tag: 'toto',
                content: 'ENCORE UN TEST',
                is_active: false
            };
            $httpBackend.flush();
            scope.editPage(page);
            expect(scope.editedPage).toEqual(page);
        });

        it ('Create a new page', function () {
            var origin = {
                newPageName: ''
            };
            scope.createPageForm = {
                newPageName: 'test a la con'
            };
            $httpBackend.flush();
            var nbPage = scope.pageList.length;
            scope.createPage();
            expect(scope.pageList.length).toBe(nbPage + 1);
            expect(scope.pageList[scope.pageList.length - 1].tag).toEqual('test-a-la-con');
        });

        it ('Save a page', function () {
            var page = {
                    id: 2,
                    title: 'Page pour toto',
                    tag: 'toto',
                    content: 'ENCORE UN TEST',
                    is_active: false
                };
            scope.saveEditPage(page);
            $httpBackend.flush();
        });

        it ('Edit user', function () {
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
                    isActive: 0,
                    role: 'admin'
                };
            scope.userEdit(user);
            $httpBackend.flush();
        });

        it ('Save user', function () {
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
                    isActive: 0,
                    role: 'admin'
                };
            scope.userSave(user);
            $httpBackend.flush();
        });

        it ('Reset user password', function () {
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
                    isActive: 0,
                    role: 'admin'
                };
            scope.userResetPassword(user);
            $httpBackend.flush();
        });

        it ('Close admin journey', function () {
            scope.closeAdminJourney();
            $httpBackend.flush();
        });

        it ('Remove a user', function () {
            $httpBackend.flush();
            expect(scope.userList.length).toBe(2);
            scope.userTrash(0);
            expect(scope.userList.length).toBe(1);
        });

        it ('Activate a run', function () {
            var run = {
                    id: 2,
                    name: 'Les templiers',
                    type: 'trail',
                    address_start: 'Millau, France',
                    date_start: '2015-09-15 00:00:00',
                    time_start: '06:30',
                    distances: '72km',
                    elevations: '2500+',
                    info: 'ksdjlsdjlf jsdlfjl sjdflj',
                    is_active: 1
                },
                run2 = {
                    id: 2,
                    name: 'Les templiers',
                    type: 'trail',
                    address_start: 'Millau, France',
                    date_start: '2015-09-15 00:00:00',
                    time_start: '06:30',
                    distances: '72km',
                    elevations: '2500+',
                    info: 'ksdjlsdjlf jsdlfjl sjdflj',
                    is_active: 0
                };
            scope.runToggleActive(run);
            expect(run.is_active).not.toBeTruthy();
            scope.runToggleActive(run2);
            expect(run2.is_active).toBeTruthy();
            $httpBackend.flush();
        });

        it ('Toggle payment for a journey', function () {
            var journey = {
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-09-06 00:00:00',
                time_start_outward: '06:00',
                nb_space_outward: 2,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1
            };
            $httpBackend.flush();
            scope.selectedJourney = journey;
            scope.journeyPayedToggle(true);
            expect(scope.selectedJourney.is_payed).not.toBeTruthy();
            scope.journeyPayedToggle(false);
            expect(scope.selectedJourney.is_payed).toBeTruthy();
        });

        it ('Open journey', function () {
            var journey = {
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-09-06 00:00:00',
                time_start_outward: '06:00',
                nb_space_outward: 2,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1,
                User: {
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
                    picture: null
                }
            };
            scope.openJourneyAction(journey);
            $httpBackend.flush();
            expect(scope.selectedJourney).toEqual(journey);
            expect(scope.selectedJourneyUserRIB).toEqual({ id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 });
            expect(scope.selectedJourneyJoins.length).toBe(2);
            expect(scope.amountToPay).toBe(30);
        });

        it('Show partner form', function () {
            expect(scope.partnerCreation).toBeFalsy();
            $httpBackend.flush();
            scope.switchPartner();
            expect(scope.partnerCreation).toBeTruthy();
            scope.switchPartner();
            expect(scope.partnerCreation).toBeFalsy();
        });

        it('Create new partner', function () {
            var newPartner = {
                name: 'TOTO',
                fee: 7.8,
                expiry: '2017-09-15 00:00:00',
                user: {
                    name: 'test',
                    id: 1
                }
            };
            expect(scope.partnerCreation).toBeFalsy();
            $httpBackend.flush();
            scope.switchPartner();
            expect(scope.partnerCreation).toBeTruthy();
            scope.createPartner(newPartner);
            $httpBackend.flush();
            expect(scope.partnersList.length).toEqual(3);
            expect(scope.partnerCreation).toBeFalsy();
        });

        it('Send info to partner', function () {
            $httpBackend.flush();
            scope.sendInfoPartner(1);
            $httpBackend.flush();
        });
    });
});