'use strict';

describe('service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    // Test service availability
    it('check the existence of MyRunTripFees', inject(function(MyRunTripFees) {
        expect(MyRunTripFees).toBeDefined();
    }));

    describe('BankAccount Service', function() {

        beforeEach(inject(function(BankAccount, _$httpBackend_){
            service = BankAccount;
            $httpBackend = _$httpBackend_;
        }));

        it('check the existence of BankAccount', function() {
            expect(service).toBeDefined();
        });

        it('should get bank account', function() {
            $httpBackend.whenGET('/api/user/bankaccount').respond([
                { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1},
                { id: 2, owner: 'Richard Couret', agency_name: 'CIC', IBAN: 'TESTIBAN', BIC: 'TESTBIC', UserId: 2}
            ]);
            var promise = service.get(),
                bankAccounts = null;

            promise.then(function(ret){
                bankAccounts = ret;
            });
            $httpBackend.flush();
            expect(bankAccounts instanceof Array).toBeTruthy();
            expect(bankAccounts.length).toBe(2);
            expect(bankAccounts[1]).toEqual({ id: 2, owner: 'Richard Couret', agency_name: 'CIC', IBAN: 'TESTIBAN', BIC: 'TESTBIC', UserId: 2});
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
            $httpBackend.whenPOST('/api/user/bankaccount').respond('bankAccountSaved');
            var account = { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1},
                promise = service.save(account),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message).toEqual('bankAccountSaved');

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
            $httpBackend.whenPOST('/api/admin/page').respond('pageSaved');
            var newPage = { id: 3, title: 'Page pour test', tag: 'mrt', content: 'MRT the Best', is_active: true},
                promise = service.save(newPage),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message).toEqual('pageSaved');

        });

        it('should fail to save new page', function() {
            $httpBackend.whenPOST('/api/admin/page').respond(500);
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
            $httpBackend.whenPOST('/api/admin/options').respond('emailOptionsSaved');

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
            expect(message).toEqual('emailOptionsSaved');
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

    });
});