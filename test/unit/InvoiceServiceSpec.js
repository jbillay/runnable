/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Invoice Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Invoice Service', function() {

        beforeEach(inject(function(Invoice, _$httpBackend_, $rootScope){
            service = Invoice;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Invoice', function() {
            expect(service).toBeDefined();
        });

        it('should get invoices by user', function() {
            $httpBackend.whenGET('/api/invoice').respond([
                {
                    id: 1,
                    status: 'completed',
                    amount: 108.27,
                    fees: 8.27,
                    ref: 'MRT20150217LA6E9',
                    transaction: '',
                    UserId: 1,
                    JourneyId: 1,
                    JoinId: 1
                }
            ]);
            var promise = service.getByUser(),
                invoiceList = null;

            promise.then(function(ret){
                invoiceList = ret;
            });
            $httpBackend.flush();
            expect(invoiceList instanceof Array).toBeTruthy();
            expect(invoiceList.length).toBe(1);
            expect(invoiceList[0].id).toBe(1);
            expect(invoiceList[0].status).toEqual('completed');
            expect(invoiceList[0].amount).toBe(108.27);
            expect(invoiceList[0].fees).toBe(8.27);
            expect(invoiceList[0].ref).toEqual('MRT20150217LA6E9');
            expect(invoiceList[0].transaction).toEqual('');
        });

        it('should fail to get invoices by user', function() {
            $httpBackend.whenGET('/api/invoice').respond(500);
            var promise = service.getByUser(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get invoices by driver', function() {
            $httpBackend.whenGET('/api/invoice/driver').respond([
                {
                    id: 1,
                    status: 'completed',
                    amount: 108.27,
                    fees: 8.27,
                    ref: 'MRT20150217LA6E9',
                    transaction: '',
                    UserId: 1,
                    JourneyId: 1,
                    JoinId: 1
                }
            ]);
            var promise = service.getByDriver(),
                driverInvoiceList = null;

            promise.then(function(ret){
                driverInvoiceList = ret;
            });
            $httpBackend.flush();
            expect(driverInvoiceList instanceof Array).toBeTruthy();
            expect(driverInvoiceList.length).toBe(1);
            expect(driverInvoiceList[0].id).toBe(1);
            expect(driverInvoiceList[0].status).toEqual('completed');
            expect(driverInvoiceList[0].amount).toBe(108.27);
            expect(driverInvoiceList[0].fees).toBe(8.27);
            expect(driverInvoiceList[0].ref).toEqual('MRT20150217LA6E9');
            expect(driverInvoiceList[0].transaction).toEqual('');
        });

        it('should fail to get invoices by driver', function() {
            $httpBackend.whenGET('/api/invoice/driver').respond(500);
            var promise = service.getByDriver(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should force completed for a Inoivce - PayPal Issue', function() {
            $httpBackend.whenPOST('/api/admin/invoice/complete').respond(200);
            var promise = service.complete(24, 'MRT20150217LA6E9'),
                result = null;

            promise.then(function(ret) {
                result = ret;
            });
            $httpBackend.flush();
            expect(result).toBeUndefined();
        });

        it('should force completed for a Inoivce - PayPal Issue', function() {
            $httpBackend.whenPOST('/api/admin/invoice/complete').respond(401);
            var promise = service.complete(24, 'MRT20150217LA6E9'),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function (err) {
                result = err;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
    });
});