/**
 * Created by jeremy on 05/05/2016.
 */

'use strict';

describe('service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('MyRunTripFees Service', function() {
    
        beforeEach(inject(function(MyRunTripFees, _$httpBackend_, $rootScope){
            service = MyRunTripFees;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));
    
        it('check the existence of MyRunTripFees', function() {
            expect(service).toBeDefined();
        });
    
        it('check if time is correctly calculated', function () {
            var newActualTime = new Date(2015, 8, 10, 8, 30, 0);
    
            jasmine.clock().mockDate(newActualTime);
            expect(service.getTimeBeforeStart('2015-09-12', '08:30')).toBe(172800);
        });
    
        it('check if fees is correctly calculated', function () {
            var newActualTime = new Date(2015, 9, 10, 10, 30, 0),
                startDateTwoDays = '2015-09-12T00:00:00.000Z',
                startDateOneDays = '2015-09-11T00:00:00.000Z',
                startDateSameDays = '2015-09-10T00:00:00.000Z',
                startDateTenDays = '2015-09-22T00:00:00.000Z';
    
            jasmine.clock().mockDate(newActualTime);
            expect(service.getFees(startDateTwoDays, '10:30', 10)).toBe(2.2);
            expect(service.getFees(startDateOneDays, '10:30', 10)).toBe(2.2);
            expect(service.getFees(startDateSameDays, '10:30', 10)).toBe(2.2);
            expect(service.getFees(startDateTenDays, '10:30', 10)).toBe(2.2);
        });

        it ('should get fees for a user on a run based on journey id', function () {
            $httpBackend.whenGET('/api/fee/2')
                .respond({msg: {
                    percentage: 0.18,
                    value: 2,
                    discount: 0.2
                }, type: 'success'});
            var promise = service.getFee(2),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.percentage).toBe(0.18);
            expect(message.value).toBe(2);
            expect(message.discount).toBe(0.2);
        });

        it ('should failed to get fees for a user on a run based on journey id', function () {
            $httpBackend.whenGET('/api/fee/2').respond(500);
            var promise = service.getFee(2),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result.percentage).toBe(0.12);
            expect(result.value).toBe(1);
            expect(result.discount).toBe(0);
        });
        it ('should get an error retrieving fees for a user on a run based on journey id', function () {
            $httpBackend.whenGET('/api/fee/2').respond({msg: {
                percentage: 0.18,
                value: 2,
                discount: 0.2
            }, type: 'error'});
            var promise = service.getFee(2),
                result = null;

            promise.then(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result.percentage).toBe(0.12);
            expect(result.value).toBe(1);
            expect(result.discount).toBe(0);
        });

        it ('should get default fees', function () {
            $httpBackend.whenGET('/api/admin/default/fee')
                .respond({msg: {
                    percentage: 0.15,
                    value: 5,
                    discount: 0.1
                }, type: 'success'});
            var promise = service.getDefault(),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.percentage).toBe(0.15);
            expect(message.value).toBe(5);
            expect(message.discount).toBe(0.1);
        });

        it ('should failed to get default fees', function () {
            $httpBackend.whenGET('/api/admin/default/fee').respond(500);
            var promise = service.getDefault(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        it ('should get an error retrieving default fees', function () {
            $httpBackend.whenGET('/api/admin/default/fee').respond({msg: {
                percentage: 0.18,
                value: 2,
                discount: 0.2
            }, type: 'error'});
            var promise = service.getDefault(),
                result = null;

            promise.then(function(reason) {
                result = reason;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it ('should get update fees', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPUT('/api/admin/fee')
                .respond({msg: {
                    id: 7,
                    code: null,
                    percentage: 0.2,
                    value: 6,
                    discount: 0.8,
                    remaining: null,
                    start_date: new Date(),
                    end_date: null,
                    UserId: null,
                    RunId: 4
                }, type: 'success'});
            var updateFee = {
                id: 2,
                code: null,
                percentage: 0.2,
                value: 6,
                discount: 0.8,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 4
            };
            var promise = service.update(updateFee),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.code).toBeNull();
            expect(message.percentage).toBe(0.2);
            expect(message.value).toBe(6);
            expect(message.discount).toBe(0.8);
            expect(message.remaining).toBeNull();
            expect(message.end_date).toBeNull();
            expect(message.UserId).toBeNull();
            expect(message.RunId).toBe(4);
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it ('should failed to update fees', function () {
            $httpBackend.whenPUT('/api/admin/fee').respond(500);
            var updateFee = {
                id: 2,
                code: null,
                percentage: 0.2,
                value: 6,
                discount: 0.8,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 4
            };
            var promise = service.update(updateFee),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        it ('should get an error updating fees', function () {
            $httpBackend.whenPUT('/api/admin/fee').respond({msg: {
                percentage: 0.18,
                value: 2,
                discount: 0.2
            }, type: 'error'});
            var updateFee = {
                id: 2,
                code: null,
                percentage: 0.2,
                value: 6,
                discount: 0.8,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 4
            };
            var promise = service.update(updateFee),
                result = null;

            promise.then(function(reason) {
                result = reason;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it ('should get update fees', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/admin/fee')
                .respond({msg: {
                    id: 7,
                    code: null,
                    percentage: 0.2,
                    value: 6,
                    discount: 0.8,
                    remaining: null,
                    start_date: new Date(),
                    end_date: null,
                    UserId: null,
                    RunId: 4
                }, type: 'success'});
            var newFee = {
                code: null,
                percentage: 0.2,
                value: 6,
                discount: 0.8,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 4
            };
            var promise = service.create(newFee),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.code).toBeNull();
            expect(message.percentage).toBe(0.2);
            expect(message.value).toBe(6);
            expect(message.discount).toBe(0.8);
            expect(message.remaining).toBeNull();
            expect(message.end_date).toBeNull();
            expect(message.UserId).toBeNull();
            expect(message.RunId).toBe(4);
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it ('should failed to update fees', function () {
            $httpBackend.whenPOST('/api/admin/fee').respond(500);
            var newFee = {
                code: null,
                percentage: 0.2,
                value: 6,
                discount: 0.8,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 4
            };
            var promise = service.create(newFee),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        it ('should get an error updating fees', function () {
            $httpBackend.whenPOST('/api/admin/fee').respond({msg: {
                percentage: 0.18,
                value: 2,
                discount: 0.2
            }, type: 'error'});
            var newFee = {
                code: null,
                percentage: 0.2,
                value: 6,
                discount: 0.8,
                remaining: null,
                start_date: new Date(),
                end_date: null,
                UserId: null,
                RunId: 4
            };
            var promise = service.create(newFee),
                result = null;

            promise.then(function(reason) {
                result = reason;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it ('should check code', function () {
            $httpBackend.whenGET('/api/fee/check/MRT-JR-2016')
                .respond({msg: {
                    id: 7,
                    discount: 0.8
                }, type: 'success'});
            var promise = service.checkCode('MRT-JR-2016'),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.id).toBe(7);
            expect(message.discount).toBe(0.8);
        });

        it ('should failed to update fees', function () {
            $httpBackend.whenGET('/api/fee/check/MRT-JR-2016').respond(500);
            var promise = service.checkCode('MRT-JR-2016'),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        it ('should get an error updating fees', function () {
            $httpBackend.whenGET('/api/fee/check/MRT-JR-2016').respond({msg: {
                id: 7,
                discount: 0.2
            }, type: 'error'});
            var promise = service.checkCode('MRT-JR-2016'),
                result = null;

            promise.then(function(reason) {
                result = reason;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it ('should get fee list', function () {
            $httpBackend.whenGET('/api/admin/fees')
                .respond({msg: [  {
                        id: 2,
                        code: 'TEST',
                        percentage: null,
                        value: null,
                        discount: 0.05,
                        default: false,
                        remaining: null,
                        start_date: '2015-09-05 00:00:00',
                        end_date: '2018-01-27 00:00:00',
                        RunId: 1,
                        UserId: null
                    },
                    {
                        id: 3,
                        code: null,
                        percentage: 0.10,
                        value: 2,
                        discount: null,
                        default: false,
                        remaining: null,
                        start_date: '2015-09-05 00:00:00',
                        end_date: '2018-01-27 00:00:00',
                        RunId: 2,
                        UserId: null
                    },
                    {
                        id: 4,
                        code: null,
                        percentage: null,
                        value: null,
                        discount: 0.10,
                        default: false,
                        remaining: null,
                        start_date: '2015-09-05 00:00:00',
                        end_date: null,
                        RunId: null,
                        UserId: 1
                    }
                ], type: 'success'});
            var promise = service.getFeeList(),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message.code.length).toBe(1);
            expect(message.fees.length).toBe(2);
            expect(message.code[0].discount).toBe(0.05);
        });

        it ('should failed to update fees', function () {
            $httpBackend.whenGET('/api/admin/fees').respond(500);
            var promise = service.getFeeList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        
        it ('should get an error updating fees', function () {
            $httpBackend.whenGET('/api/admin/fees').respond({msg: [{
                id: 7,
                discount: 0.2
            }], type: 'error'});
            var promise = service.getFeeList(),
                result = null;

            promise.then(function(reason) {
                result = reason;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
        
        it ('should calculate fee', function () {
            $httpBackend.whenGET('/api/fee/2')
                .respond({msg: {
                    percentage: 0.18,
                    value: 2,
                    discount: 0.2
                }, type: 'success'});
            var promise = service.getFee(2),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(service.calculateFee(12, 10)).toBe(3.74);
            expect(service.calculateFee(12, 30)).toBe(2.91);
            expect(service.calculateFee(23, 0)).toBe(6.14);
            expect(service.calculateFee(23, null)).toBe(4.91);
            expect(service.calculateFee(0, 0)).toBe(2);
            expect(service.calculateFee(0, null)).toBe(1.6);
            expect(service.calculateFee(0, 10)).toBe(1.8);
        });
    });
});