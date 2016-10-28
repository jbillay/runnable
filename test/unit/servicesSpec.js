'use strict';

describe('service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    // Test service availability
    //it('check version of Jasmine', function () {
    //    expect(jasmine.version).toContain('2.3');
    //});

    describe('Technical Service', function() {

        beforeEach(inject(function (Technical, _$httpBackend_) {
            service = Technical;
            $httpBackend = _$httpBackend_;
        }));

        it('check the existence of Technical', function () {
            expect(service).toBeDefined();
        });

        it('should get version', function () {
            $httpBackend.whenGET('/api/version').respond('DEV');
            var promise = service.version(),
                version = null;

            promise.then(function (ret) {
                version = ret;
            });
            $httpBackend.flush();
            expect(version).toEqual('DEV');
        });

        it('should fail to get version', function () {
            $httpBackend.whenGET('/api/version').respond(500);
            var message = null;

            var promise = service.version();

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });
    });

        describe('Session Service', function() {

        beforeEach(inject(function (Session) {
            service = Session;
        }));

        it('check the existence of Session', function () {
            expect(service).toBeDefined();
        });

        it('Should create a session for the user', function () {
            var user = {
                    id: 1,
                    firstname : 'Test',
                    lastname : 'Creation',
                    address : 'Saint Germain en Laye',
                    email : 'test.creation@user.fr',
                    role : 'admin'
                };

            service.create(user);

            expect(service.userId).toBe(1);
            expect(service.userFirstname).toEqual('Test');
            expect(service.userLastname).toEqual('Creation');
            expect(service.userAddress).toEqual('Saint Germain en Laye');
            expect(service.userEmail).toEqual('test.creation@user.fr');
            expect(service.userRole).toEqual('admin');
        });

        it('Should delete a session for the user', function () {
            var user = {
                id: 1,
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                role : 'admin'
            };

            service.create(user);

            expect(service.userId).toBe(1);

            service.destroy();

            expect(service.userId).toBe(null);
            expect(service.userFirstname).toBe(null);
            expect(service.userLastname).toBe(null);
            expect(service.userAddress).toBe(null);
            expect(service.userEmail).toBe(null);
            expect(service.userRole).toBe(null);
        });
    });

    describe('AuthService Service', function() {

        beforeEach(function () {
            module(function ($provide) {
                $provide.constant('USER_ROLES', {
                    all: '*',
                    admin: 'admin',
                    editor: 'editor',
                    user: 'user'
                });
            });
            inject(function (AuthService, _$httpBackend_, $rootScope, $injector) {
                service = AuthService;
                $httpBackend = _$httpBackend_;
                rootScope = $rootScope;
            });
        });

        it('check the existence of AuthService', function () {
            expect(service).toBeDefined();
        });

        it('should reset user password', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/user/password/reset').respond({msg: 'passwordReset', type: 'success'});

            var message = null;

            var promise = service.reset('jbillay@gmail.com');

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('passwordReset');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to reset user password', function () {
            $httpBackend.whenPOST('/api/user/password/reset').respond(500);

            var message = null;

            var promise = service.reset('jbillay@gmail.com');

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should login user', function () {
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
                picture: '/uploads/users/avatar_1.jpg'
            };
            $httpBackend.whenPOST('/login').respond({msg: user, type: 'success'});

            var message = null;

            var promise = service.login({username: 'jbillay@gmail.com', password: 'noofs'});

            promise.then( function(ret) {
                message = ret;
            });

            $httpBackend.flush();
            expect(message.id).toBe(1);
        });

        it('should fail to login user due to wrong password', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/login').respond({msg: 'accountWrongPassword', type: 'error'});

            var message = null;

            var promise = service.login({username: 'jbillay@gmail.com', password: 'noofs'});

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('accountWrongPassword');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to login user', function () {
            $httpBackend.whenPOST('/login').respond(500);

            var message = null;

            var promise = service.login({username: 'jbillay@gmail.com', password: 'noofs'});

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('Should init AuthService', function () {
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

            var message = null;

            var promise = service.init();

            promise.then(function (ret) {
                message = ret;
            });

            $httpBackend.flush();
            expect(message.id).toBe(2);
        });

        it('Should fail init AuthService', function () {
            $httpBackend.whenGET('/api/user/me').respond(500);

            var message = null;

            var promise = service.init();

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('Should fail to logout user', function () {
            $httpBackend.whenGET('/logout').respond(500);

            var message = null;

            var promise = service.logout();

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('Should logout user', function () {
            $httpBackend.whenGET('/logout').respond({msg: 'userLogoff', type: 'success'});

            var message = null;

            var promise = service.logout();

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toEqual('userLogoff');
        });

        it('Should check authentification', function () {
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

            var message = null;

            var promise = service.init();

            promise.then(function (ret) {
                message = ret;
            });

            $httpBackend.flush();
            expect(service.isAuthenticated()).toBeTruthy();
        });

        it('Should failed authentification', function () {
            expect(service.isAuthenticated()).toBeFalsy();
        });

        it('Should check authorization', inject(function($injector) {
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

            var message = null;

            var promise = service.init();

            promise.then(function (ret) {
                message = ret;
            });

            $httpBackend.flush();
            expect(service.isAuthorized($injector.get('USER_ROLES').editor)).toBeTruthy();
        }));

        it('Should failed on authorization', inject(function($injector) {
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

            var message = null;

            var promise = service.init();

            promise.then(function (ret) {
                message = ret;
            });

            $httpBackend.flush();
            expect(service.isAuthorized($injector.get('USER_ROLES').admin)).toBeFalsy();
        }));
    });

    describe('BankAccount Service', function() {
        beforeEach(inject(function(BankAccount, _$httpBackend_){
            service = BankAccount;
            $httpBackend = _$httpBackend_;
        }));

        it('check the existence of BankAccount', function() {
            expect(service).toBeDefined();
        });

        it('should get bank account', function() {
            $httpBackend.whenGET('/api/user/bankaccount').respond(
                { id: 2, owner: 'Richard Couret', agency_name: 'CIC', IBAN: 'TESTIBAN', BIC: 'TESTBIC', UserId: 2});
            var promise = service.get(),
                bankAccounts = null;

            promise.then(function(ret){
                bankAccounts = ret;
            });
            $httpBackend.flush();
            expect(bankAccounts).toEqual({ id: 2, owner: 'Richard Couret', agency_name: 'CIC', IBAN: 'TESTIBAN', BIC: 'TESTBIC', UserId: 2});
        });

        it('should fail to get bank account', function() {
            $httpBackend.whenGET('/api/user/bankaccount').respond(500);
            var promise = service.get(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get user 1 bank account', function() {
            $httpBackend.whenGET('/api/admin/user/bankaccount/1').respond([
                { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 }
            ]);
            var promise = service.getByUser(1),
                bankAccounts = null;

            promise.then(function(ret){
                bankAccounts = ret;
            });
            $httpBackend.flush();
            expect(bankAccounts instanceof Array).toBeTruthy();
            expect(bankAccounts.length).toBe(1);
            expect(bankAccounts[0]).toEqual({ id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 });

        });

        it('should fail to get user 1 bank account', function() {
            $httpBackend.whenGET('/api/admin/user/bankaccount/1').respond(500);
            var promise = service.getByUser(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should save user 1 bank account', function() {
            $httpBackend.whenPOST('/api/user/bankaccount').respond({msg: 'bankAccountSaved', type: 'success'});
            var account = { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1},
                promise = service.save(account),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.msg).toEqual('bankAccountSaved');
        });

        it('should fail to resolve bank account call', function() {
            $httpBackend.whenPOST('/api/user/bankaccount').respond(500);
            var account = { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1},
                promise = service.save(account),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });
    });

    describe('Page Service', function() {

        beforeEach(inject(function(Page, _$httpBackend_){
            service = Page;
            $httpBackend = _$httpBackend_;
        }));

        it('check the existence of Page', function() {
            expect(service).toBeDefined();
        });

        it('should get page by tag', function() {
            $httpBackend.whenGET('/api/page/test').respond({id: 1, title: 'Page de test', tag: 'test',
                content: 'HTML TEXT', is_active: true});
            var promise = service.getByTag('test'),
                page = null;

            promise.then(function(ret){
                page = ret;
            });
            $httpBackend.flush();
            expect(page.id).toEqual(1);
            expect(page.title).toEqual('Page de test');
            expect(page.tag).toEqual('test');
            expect(page.content).toEqual('HTML TEXT');
            expect(page.is_active).toBe(true);
        });

        it('should fail to get page by tag', function() {
            $httpBackend.whenGET('/api/page/test').respond(500);
            var promise = service.getByTag('test'),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get page list', function() {
            $httpBackend.whenGET('/api/admin/pages').respond([
                { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 },
                { id: 2, title: 'Page pour toto', tag: 'toto', content: 'ENCORE UN TEST', is_active: false }
            ]);
            var promise = service.getList(),
                pages = null;

            promise.then(function(ret){
                pages = ret;
            });
            $httpBackend.flush();
            expect(pages instanceof Array).toBeTruthy();
            expect(pages.length).toBe(2);
            expect(pages[1]).toEqual({ id: 2, title: 'Page pour toto', tag: 'toto', content: 'ENCORE UN TEST', is_active: false });

        });

        it('should fail to get page list', function() {
            $httpBackend.whenGET('/api/admin/pages').respond(500);
            var promise = service.getList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should save new page', function() {
            $httpBackend.whenPOST('/api/admin/page').respond({msg: 'pageSaved', type: 'success'});
            var newPage = { id: 3, title: 'Page pour test', tag: 'mrt', content: 'MRT the Best', is_active: true},
                promise = service.save(newPage),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.msg).toEqual('pageSaved');

        });

        it('should fail to save new page', function() {
            $httpBackend.whenPOST('/api/admin/page').respond(500);
            var newPage = { id: 3, title: 'Page pour test', tag: 'mrt', content: 'MRT the Best', is_active: true},
                promise = service.save(newPage),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });
    });

    describe('EmailOptions Service', function() {

        beforeEach(inject(function(EmailOptions, _$httpBackend_, $rootScope){
            service = EmailOptions;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of EmailOptions', function() {
            expect(service).toBeDefined();
        });

        it('should get email options', function() {
            $httpBackend.whenGET('/api/admin/options').respond([
                { id: 1, name: 'emailTemplate', value: 'emailTemplateTest'},
                { id: 2, name: 'mailConfig', value: 'mailConfigTest'}
            ]);
            var promise = service.get(),
                emailOptionsList = null;

            promise.then(function(ret){
                emailOptionsList = ret;
            });
            $httpBackend.flush();
            expect(emailOptionsList instanceof Array).toBeTruthy();
            expect(emailOptionsList.length).toBe(2);
            expect(emailOptionsList[0].id).toEqual(1);
            expect(emailOptionsList[0].name).toEqual('emailTemplate');
            expect(emailOptionsList[0].value).toEqual('emailTemplateTest');
            expect(emailOptionsList[1].id).toEqual(2);
            expect(emailOptionsList[1].name).toEqual('mailConfig');
            expect(emailOptionsList[1].value).toEqual('mailConfigTest');
        });

        it('should fail to get email options', function() {
            $httpBackend.whenGET('/api/admin/options').respond(500);
            var promise = service.get(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should save email options', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/admin/options').respond({msg: 'emailOptionsSaved', type: 'success'});

            var optionData = {},
                message = null;
            optionData.mailConfig = {host: 'mail.ovh.com', user: 'jbillay@gmail.com', password: 'noofs', transport: 'SMTP', from: 'My Run Trip <postmaster@myruntrip.com>', to: 'postmaster@myruntrip.com', bcc: 'jbillay@gmail.com', send: false};
            optionData.emailTemplate = [{id: 0, name: 'Test', key: ['articleName', 'stockDate'], html: 'TEST Out of stock HTML', text: 'TEST Out of Stock TEXT'},
                {id: 1, name: 'Tracking Generic', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST BDD', text: 'TEST Tracking Generic TEXT'},
                {id: 3, name: 'Tracking Xpole', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST'}];

            var promise = service.save(optionData);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('emailOptionsSaved');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should fail to save email options', function() {
            $httpBackend.whenPOST('/api/admin/options').respond(500);
            var optionData = {},
                message = null;
            optionData.mailConfig = {host: 'mail.ovh.com', user: 'jbillay@gmail.com', password: 'noofs', transport: 'SMTP', from: 'My Run Trip <postmaster@myruntrip.com>', to: 'postmaster@myruntrip.com', bcc: 'jbillay@gmail.com', send: false};
            optionData.emailTemplate = [{id: 0, name: 'Test', key: ['articleName', 'stockDate'], html: 'TEST Out of stock HTML', text: 'TEST Out of Stock TEXT'},
                {id: 1, name: 'Tracking Generic', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST BDD', text: 'TEST Tracking Generic TEXT'},
                {id: 3, name: 'Tracking Xpole', key: ['deliveryName', 'deliveryURL', 'trackingNumber'], html: 'TEST'}];

            var promise = service.save(optionData);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });
    });

    describe('User Service', function() {

        beforeEach(inject(function(User, _$httpBackend_, $rootScope){
            service = User;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of User', function() {
            expect(service).toBeDefined();
        });

        it('should create a user', function () {
            $httpBackend.whenPOST('/api/user').respond({msg: {
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 1,
                role: 'editor',
                picture: null
            }, type: 'success'});

            var user = {
                    firstname: 'Richard',
                    lastname: 'Couret',
                    address: 'Bouffemont',
                    email : 'test.creation@user.fr',
                    password : 'test',
                    password_confirmation : 'test'
                },
                message = null;

            var promise = service.create(user);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.id).toEqual(2);
            expect(message.firstname).toEqual('Richard');
            expect(message.lastname).toEqual('Couret');
            expect(message.address).toEqual('Bouffemont');
            expect(message.phone).toEqual('0689876547');
            expect(message.email).toEqual('richard.couret@free.fr');
            expect(message.itra).toEqual('?id=84500&nom=COURET#tab');
            expect(message.isActive).toBe(1);
            expect(message.role).toEqual('editor');
            expect(message.picture).toBe(null);
        });

        it('Creation of user failed', function () {
            $httpBackend.whenPOST('/api/user').respond({msg: 'existingAccount', type: 'error'});

            var user = {
                    firstname: 'Richard',
                    lastname: 'Couret',
                    address: 'Bouffemont',
                    email : 'test.creation@user.fr',
                    password : 'test',
                    password_confirmation : 'test'
                },
                message = null;

            var promise = service.create(user);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toEqual('error existingAccount');
        });

        it('should failed to create a user', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/user').respond(500);

            var user = {
                    firstname : 'Test',
                    lastname : 'Creation',
                    address : 'Saint Germain en Laye',
                    email : 'test.creation@user.fr',
                    password : 'test',
                    password_confirmation : 'test'
                },
                message = null;

            var promise = service.create(user);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should update a user', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPUT('/api/user').respond({msg: 'accountUpdated', type: 'success'});

            var user = {
                    firstname : 'Test',
                    lastname : 'Creation',
                    address : 'Saint Germain en Laye',
                    email : 'test.creation@user.fr',
                    password : 'test',
                    password_confirmation : 'test'
                },
                message = null;

            var promise = service.update(user);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('accountUpdated');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to update a user', function () {
            $httpBackend.whenPUT('/api/user').respond(500);

            var user = {
                    firstname : 'Test',
                    lastname : 'Creation',
                    address : 'Saint Germain en Laye',
                    email : 'test.creation@user.fr',
                    password : 'test',
                    password_confirmation : 'test'
                },
                message = null;

            var promise = service.update(user);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should delete a user', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/admin/user/remove').respond('userDeleted');

            var userId = 1,
                message = null;

            var promise = service.delete(userId);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('userDeleted');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to delete a user', function () {
            $httpBackend.whenPOST('/api/admin/user/remove').respond(500);

            var userId = 1,
                message = null;

            var promise = service.delete(userId);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get a user', function() {
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
            var promise = service.getUser(),
                userInfo = null;

            promise.then(function(ret){
                userInfo = ret;
            });
            $httpBackend.flush();
            expect(userInfo.id).toEqual(2);
            expect(userInfo.firstname).toEqual('Richard');
            expect(userInfo.lastname).toEqual('Couret');
            expect(userInfo.address).toEqual('Bouffemont');
            expect(userInfo.phone).toEqual('0689876547');
            expect(userInfo.email).toEqual('richard.couret@free.fr');
            expect(userInfo.itra).toEqual('?id=84500&nom=COURET#tab');
            expect(userInfo.isActive).toBe(0);
            expect(userInfo.role).toEqual('editor');
            expect(userInfo.picture).toBe(null);
        });

        it('should fail to get a user', function() {
            $httpBackend.whenGET('/api/user/me').respond(500);
            var promise = service.getUser(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get user public info', function() {
            $httpBackend.whenGET('/api/user/public/info/1').respond({
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                isActive: 0,
                role: 'editor',
                Journeys: [
                    { id: 1 }
                ],
                Participates: [
                    { id: 1 }
                ]
            });
            var promise = service.getPublicInfo(1),
                userPublicInfo = null;

            promise.then(function(ret){
                userPublicInfo = ret;
            });

            $httpBackend.flush();
            expect(userPublicInfo.id).toEqual(2);
            expect(userPublicInfo.firstname).toEqual('Richard');
            expect(userPublicInfo.lastname).toEqual('Couret');
            expect(userPublicInfo.address).toEqual('Bouffemont');
            expect(userPublicInfo.phone).toEqual('0689876547');
            expect(userPublicInfo.email).toEqual('richard.couret@free.fr');
            expect(userPublicInfo.isActive).toBe(0);
            expect(userPublicInfo.role).toEqual('editor');
            expect(userPublicInfo.Journeys instanceof Array).toBeTruthy();
            expect(userPublicInfo.Participates instanceof Array).toBeTruthy();
        });

        it('should fail to get user public info', function() {
            $httpBackend.whenGET('/api/user/public/info/1').respond(500);
            var promise = service.getPublicInfo(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get user public info', function() {
            $httpBackend.whenGET('/api/user/public/driver/1').respond([{
                id: 1,
                comment_driver: 'Conducteur moyen',
                comment_service: 'Myruntrip est vraiment un service de qualité. Merci pour tout votre travail',
                rate_driver: 3,
                rate_service: 5,
                JoinId: 4,
                UserId: 1
            }]);
            var promise = service.getPublicDriverInfo(1),
                userPublicDriverInfo = null;

            promise.then(function(ret){
                userPublicDriverInfo = ret;
            });

            $httpBackend.flush();
            expect(userPublicDriverInfo[0].id).toBe(1);
            expect(userPublicDriverInfo[0].comment_driver).toEqual('Conducteur moyen');
            expect(userPublicDriverInfo[0].comment_service).toEqual('Myruntrip est vraiment un service de qualité. Merci pour tout votre travail');
            expect(userPublicDriverInfo[0].rate_driver).toBe(3);
            expect(userPublicDriverInfo[0].rate_service).toBe(5);
        });

        it('should fail to get user public info', function() {
            $httpBackend.whenGET('/api/user/public/driver/1').respond(500);
            var promise = service.getPublicDriverInfo(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get user itra runs', function() {
            $httpBackend.whenGET('/api/user/runs').respond('HTML');
            var promise = service.getItraRuns(1),
                itraRun = null;

            promise.then(function(ret){
                itraRun = ret;
            });

            $httpBackend.flush();
            expect(itraRun).toEqual('HTML');
        });

        it('should fail to get user itra runs', function() {
            $httpBackend.whenGET('/api/user/runs').respond(500);
            var promise = service.getItraRuns(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get user journeys', function() {
            $httpBackend.whenGET('/api/user/journeys').respond([{
                    id: 4,
                    address_start: 'Nice',
                    distance: '300 km',
                    duration: '3 heures 10 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-06-25 00:00:00',
                    time_start_outward: '09:00',
                    nb_space_outward: 1,
                    date_start_return: '2015-06-26 00:00:00',
                    time_start_return: '11:00',
                    nb_space_return: 1,
                    car_type: 'citadine',
                    amount: 26,
                    is_canceled: true,
                    RunId: 4,
                    UserId: 2
                }]);
            var promise = service.getJourney(),
                userJourneys = null;

            promise.then(function(ret){
                userJourneys = ret;
            });

            $httpBackend.flush();
            expect(userJourneys[0].id).toBe(4);
            expect(userJourneys[0].address_start).toEqual('Nice');
            expect(userJourneys[0].distance).toEqual('300 km');
            expect(userJourneys[0].duration).toEqual('3 heures 10 minutes');
            expect(userJourneys[0].journey_type).toEqual('aller-retour');
            expect(userJourneys[0].date_start_outward).toEqual('2015-06-25 00:00:00');
            expect(userJourneys[0].time_start_outward).toEqual('09:00');
            expect(userJourneys[0].nb_space_outward).toBe(1);
            expect(userJourneys[0].date_start_return).toEqual('2015-06-26 00:00:00');
            expect(userJourneys[0].time_start_return).toEqual('11:00');
            expect(userJourneys[0].nb_space_return).toBe(1);
            expect(userJourneys[0].amount).toBe(26);
            expect(userJourneys[0].car_type).toEqual('citadine');
        });

        it('should fail to get user journeys', function() {
            $httpBackend.whenGET('/api/user/journeys').respond(500);
            var promise = service.getJourney(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get journey free space', function() {
            var ret = {
                    outward: 2,
                    return: 3
                },
                journey = {
                    id: 1,
                    nb_space_outward: 5,
                    nb_space_return: 5
                };
            $httpBackend.whenGET('/api/journey/book/1').respond(ret);
            var promise = service.getJourneyFreeSpace(journey),
                retPlace = null;

            promise.then(function(ret){
                retPlace = ret;
            });

            $httpBackend.flush();
            expect(retPlace.nb_free_place_outward).toBe(3);
            expect(retPlace.nb_free_place_return).toBe(2);
        });

        it('should fail to get journey free space', function() {
            var journey = {
                id: 1,
                nb_space_outward: 5,
                nb_space_return: 5
            };
            $httpBackend.whenGET('/api/journey/book/1').respond(500);
            var promise = service.getJourneyFreeSpace(journey),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get user joins', function() {
            $httpBackend.whenGET('/api/user/joins').respond([{
                id: 1,
                nb_place_outward: 2,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 1
            }]);
            var promise = service.getJoin(),
                userJoins = null;

            promise.then(function(ret){
                userJoins = ret;
            });

            $httpBackend.flush();
            expect(userJoins[0].id).toBe(1);
            expect(userJoins[0].nb_place_outward).toBe(2);
            expect(userJoins[0].nb_place_return).toBe(2);
        });

        it('should fail to get user joins', function() {
            $httpBackend.whenGET('/api/user/joins').respond(500);
            var promise = service.getJoin(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get all users', function() {
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
                role: 'admin',
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
            var promise = service.getList(),
                allUsers = null;

            promise.then(function(ret){
                allUsers = ret;
            });

            $httpBackend.flush();
            expect(allUsers instanceof Array).toBeTruthy();
            expect(allUsers[1].id).toEqual(2);
            expect(allUsers[1].firstname).toEqual('Richard');
            expect(allUsers[1].lastname).toEqual('Couret');
            expect(allUsers[1].address).toEqual('Bouffemont');
            expect(allUsers[1].phone).toEqual('0689876547');
            expect(allUsers[1].email).toEqual('richard.couret@free.fr');
            expect(allUsers[1].itra).toEqual('?id=84500&nom=COURET#tab');
            expect(allUsers[1].isActive).toBe(0);
            expect(allUsers[1].role).toEqual('editor');
            expect(allUsers[1].picture).toBe(null);
        });

        it('should fail to get all users', function() {
            $httpBackend.whenGET('/api/admin/users').respond(500);
            var promise = service.getList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should toggle the activation of a user', function () {
            $httpBackend.whenPOST('/api/admin/user/active').respond({msg: 'userToggleActive', type: 'success'});

            var userId = 1,
                message = null;

            var promise = service.userToggleActive(userId);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('userToggleActive');
        });

        it('should failed to toggle the activation of a user', function () {
            $httpBackend.whenPOST('/api/admin/user/active').respond(500);

            var userId = 1,
                message = null;

            var promise = service.userToggleActive(userId);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should update user password', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/user/password/update').respond({msg: 'userToggleActive', type: 'success'});

            var message = null;

            var promise = service.updatePassword('toto');

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('userToggleActive');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to update user password', function () {
            $httpBackend.whenPOST('/api/user/password/update').respond(500);

            var message = null;

            var promise = service.updatePassword('toto');

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should invite friends', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/user/invite').respond({msg: 'Invitation(s) envoyée(s)'});

            var invite = {
                    inviteEmails: 'jbillay@gmail.com',
                    inviteMessage: 'Bonjour à tous'
                },
                message = null;

            var promise = service.inviteFriends(invite);

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('Invitation(s) envoyée(s)');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to invite friends', function () {
            $httpBackend.whenPOST('/api/user/invite').respond(500);

            var invite = {
                    inviteEmails: 'jbillay@gmail.com',
                    inviteMessage: 'Bonjour à tous'
                },
                message = null;

            var promise = service.inviteFriends(invite);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should upload user photo', function () {
            $httpBackend.whenPOST('/api/user/picture').respond({
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
                picture: '/uploads/users/avatar_1.jpg'
            });

            var file = '.',
                userDetail = null;

            var promise = service.uploadPicture(file);

            promise.then(function(ret){
                userDetail = ret;
            });

            $httpBackend.flush();
            expect(userDetail.id).toBe(1);
            expect(userDetail.firstname).toEqual('Jeremy');
            expect(userDetail.lastname).toEqual('Billay');
            expect(userDetail.address).toEqual('Saint Germain en laye');
            expect(userDetail.phone).toEqual('0689876547');
            expect(userDetail.email).toEqual('jbillay@gmail.com');
            expect(userDetail.itra).toBe(null);
            expect(userDetail.isActive).toBe(1);
            expect(userDetail.role).toEqual('admin');
            expect(userDetail.picture).toEqual('/uploads/users/avatar_1.jpg');
        });

        it('should failed to upload user photo', function () {
            $httpBackend.whenPOST('/api/user/picture').respond(500);

            var file = '.',
                message = null;

            var promise = service.uploadPicture(file);

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });
    });
});