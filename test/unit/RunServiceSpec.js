/**
 * Created by jeremy on 22/05/15.
 */
/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('Run Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('Run Service', function() {

        beforeEach(inject(function(Run, _$httpBackend_, $rootScope){
            service = Run;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of Run', function() {
            expect(service).toBeDefined();
        });

        it('should get run 1 details', function() {
            $httpBackend.whenGET('/api/run/1').respond({
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
            });
            var promise = service.getDetail(1),
                runDetail = null;

            promise.then(function(ret){
                runDetail = ret;
            });

            $httpBackend.flush();
            expect(runDetail.id).toBe(1);
            expect(runDetail.name).toEqual('Maxicross');
            expect(runDetail.type).toEqual('trail');
            expect(runDetail.address_start).toEqual('Bouffémont, France');
            expect(runDetail.date_start).toEqual('2015-02-02 00:00:00');
            expect(runDetail.time_start).toEqual('09:15');
            expect(runDetail.distances).toEqual('15k - 30k - 7k');
            expect(runDetail.elevations).toEqual('500+ - 1400+');
            expect(runDetail.info).toEqual('Toutes les infos sur le maxicross');
            expect(runDetail.is_active).toBe(1);
        });

        it('should fail to get detail on run 1', function() {
            $httpBackend.whenGET('/api/run/1').respond(500);
            var promise = service.getDetail(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get run active list', function() {
            $httpBackend.whenGET('/api/run/list').respond([{
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
            var promise = service.getActiveList(),
                runList = null;

            promise.then(function(ret){
                runList = ret;
            });

            $httpBackend.flush();
            expect(runList instanceof Array).toBeTruthy();
            expect(runList.length).toBe(2);
            expect(runList[0].id).toBe(1);
            expect(runList[0].name).toEqual('Maxicross');
            expect(runList[0].type).toEqual('trail');
            expect(runList[0].address_start).toEqual('Bouffémont, France');
            expect(runList[0].date_start).toEqual('2015-02-02 00:00:00');
            expect(runList[0].time_start).toEqual('09:15');
            expect(runList[0].distances).toEqual('15k - 30k - 7k');
            expect(runList[0].elevations).toEqual('500+ - 1400+');
            expect(runList[0].info).toEqual('Toutes les infos sur le maxicross');
            expect(runList[0].is_active).toBe(1);
        });

        it('should fail to get run active list', function() {
            $httpBackend.whenGET('/api/run/list').respond(500);
            var promise = service.getActiveList(),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get next run list', function() {
            $httpBackend.whenGET('/api/run/next/1').respond([{
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
                }]);
            var promise = service.getNextList(1),
                runList = null;

            promise.then(function(ret){
                runList = ret;
            });

            $httpBackend.flush();
            expect(runList instanceof Array).toBeTruthy();
            expect(runList.length).toBe(1);
            expect(runList[0].id).toBe(1);
            expect(runList[0].name).toEqual('Maxicross');
            expect(runList[0].type).toEqual('trail');
            expect(runList[0].address_start).toEqual('Bouffémont, France');
            expect(runList[0].date_start).toEqual('2015-02-02 00:00:00');
            expect(runList[0].time_start).toEqual('09:15');
            expect(runList[0].distances).toEqual('15k - 30k - 7k');
            expect(runList[0].elevations).toEqual('500+ - 1400+');
            expect(runList[0].info).toEqual('Toutes les infos sur le maxicross');
            expect(runList[0].is_active).toBe(1);
        });

        it('should fail to get next list', function() {
            $httpBackend.whenGET('/api/run/next/1').respond(500);
            var promise = service.getNextList(1),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });

        it('should get run list', function() {
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
            var promise = service.getList(),
                runList = null;

            promise.then(function(ret){
                runList = ret;
            });

            $httpBackend.flush();
            expect(runList instanceof Array).toBeTruthy();
            expect(runList.length).toBe(2);
            expect(runList[0].id).toBe(1);
            expect(runList[0].name).toEqual('Maxicross');
            expect(runList[0].type).toEqual('trail');
            expect(runList[0].address_start).toEqual('Bouffémont, France');
            expect(runList[0].date_start).toEqual('2015-02-02 00:00:00');
            expect(runList[0].time_start).toEqual('09:15');
            expect(runList[0].distances).toEqual('15k - 30k - 7k');
            expect(runList[0].elevations).toEqual('500+ - 1400+');
            expect(runList[0].info).toEqual('Toutes les infos sur le maxicross');
            expect(runList[0].is_active).toBe(1);
        });

        it('should fail to get run list', function() {
            $httpBackend.whenGET('/api/admin/runs').respond(500);
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

        it('should toggle run active flag', function() {
            $httpBackend.whenPOST('/api/admin/run/active').respond('done');
            var promise = service.toggleActive(1),
                message = null;

            promise.then(function(ret){
                message = ret;
            });
            $httpBackend.flush();
            expect(message).toEqual('done');
        });

        it('should fail to toggle run active flag', function() {
            $httpBackend.whenPOST('/api/admin/run/active').respond(500);
            var promise = service.toggleActive(1),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should search run', function() {
            $httpBackend.whenPOST('/api/run/search').respond([{
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
            var promise = service.search({name: 'Les templ'}),
                searchRunList = null;

            promise.then(function(ret){
                searchRunList = ret;
            });
            $httpBackend.flush();
            expect(searchRunList instanceof Array).toBeTruthy();
            expect(searchRunList.length).toBe(1);
            expect(searchRunList[0].id).toBe(2);
            expect(searchRunList[0].name).toEqual('Les templiers');
            expect(searchRunList[0].type).toEqual('trail');
            expect(searchRunList[0].address_start).toEqual('Millau, France');
            expect(searchRunList[0].date_start).toEqual('2015-09-15 00:00:00');
            expect(searchRunList[0].time_start).toEqual('06:30');
            expect(searchRunList[0].distances).toEqual('72km');
            expect(searchRunList[0].elevations).toEqual('2500+');
            expect(searchRunList[0].info).toEqual('ksdjlsdjlf jsdlfjl sjdflj');
            expect(searchRunList[0].is_active).toBe(1);
        });

        it('should fail to search run', function() {
            $httpBackend.whenPOST('/api/run/search').respond(500);
            var promise = service.search({name: 'Les templ'}),
                message = null;

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });
            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should update a run', function() {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPUT('/api/run').respond('runUpdated');
            var run = {
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
                promise = service.update(run),
                message = null;

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('runUpdated');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should fail to update a run', function() {
            $httpBackend.whenPUT('/api/run').respond(500);
            var run = {
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
                promise = service.update(run),
                result = null;

            promise.then(function(ret) {
                result = ret;
            }).catch(function(reason) {
                result = reason;
            });
            $httpBackend.flush();
            expect(result).toContain('error');
        });
    });
});