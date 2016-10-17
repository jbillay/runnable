'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableRunCreateController', function(){
        var scope, rootScope, timeout, location, ctrl, $httpBackend, form, FileReader;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $timeout, $location, $controller, $compile, _fileReader_) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            timeout = $timeout;
            location = $location;
            FileReader = _fileReader_;
            $httpBackend.whenGET('/api/run/list').respond({msg: [{
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
                }], type: 'success'});
            $httpBackend.whenPOST('/api/run').respond({msg: 'runCreated', type: 'success'});

            form = angular.element('<form name="createRun" novalidate></form>');
            form.appendTo(document.body);
            form = $compile(form)(scope);
            scope.$digest();

            ctrl = $controller('RunnableRunCreateController',
                {$rootScope: rootScope, $scope: scope, $location: location, fileReader: FileReader});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            expect(scope.newRun.type).toEqual('trail');
            expect(scope.calendar.opened).not.toBeTruthy();
        });

        it ('Try to open calendar', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            scope.calendar.open(e);
            expect(scope.calendar.opened).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Get location', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            scope.getLocation('Paris, France');
        });

        it ('Get selected address', function () {
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            scope.selectedAddress('Paris, France');
        });

        it ('Submit a run', function () {
            spyOn(location, 'path');
            var newRun = {
                id: 3,
                name: 'Test',
                type: 'marathon',
                address_start: 'Tulles, France',
                date_start: '2015-09-15 00:00:00',
                time_start: '06:30',
                distances: '72km',
                elevations: '2500+',
                info: 'ksdjlsdjlf jsdlfjl sjdflj',
                is_active: 1
            };
            expect(scope.page).toEqual('Run');
            $httpBackend.flush();
            timeout.flush();
            scope.submitRun(scope.createRun, newRun);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/run');
        });


        it ('Should test all uploadFile options', function () {
            spyOn(FileReader, 'readAsDataUrl').and.callFake(function() {
                return { then: function(callback) { return callback('File Read'); } }; });
            scope.uploadFile('logo', '.uploadLogo', ['toto']);
            expect(scope.logo.errFile).toBeNull();
            scope.uploadFile('logo', null, ['toto']);
            expect(scope.logo.errFile).toBe('toto');
            scope.uploadFile('pictures', '.uploadPicture', ['toto']);
            expect(scope.pictures.errFile).toBeNull();
            scope.uploadFile('pictures', null, ['toto']);
            expect(scope.pictures.errFile).toBe('toto');
            scope.uploadFile('toto', null, null);
            expect(FileReader.readAsDataUrl).toHaveBeenCalled();
        });

        it('Should test remove of logo', function () {
            scope.logo = {name: 'toto'};
            scope.removeLogo();
            expect(scope.logo).toEqual({});
        });
        it('Should test remove of picture', function () {
            spyOn(FileReader, 'readAsDataUrl').and.callFake(function() {
                return { then: function(callback) { return callback('File Read'); } }; });
            expect(scope.runListImg.length).toBe(0);
            scope.uploadFile('pictures', '.removePicture', ['toto']);
            expect(scope.runListImg.length).toBe(1);
            expect(FileReader.readAsDataUrl).toHaveBeenCalled();
            scope.removePicture(0);
            expect(scope.runListImg.length).toBe(0);
        });
        it('Should check the limit of pictures', function () {
            spyOn(FileReader, 'readAsDataUrl').and.callFake(function() {
                return { then: function(callback) { return callback('File Read'); } }; });
            expect(scope.runListImg.length).toBe(0);
            scope.uploadFile('pictures', {name: '.removePicture1'}, ['toto']);
            expect(scope.runListImg.length).toBe(1);
            scope.uploadFile('pictures', {name: '.removePicture2'}, ['toto']);
            expect(scope.runListImg.length).toBe(2);
            scope.uploadFile('pictures', {name: '.removePicture3'}, ['toto']);
            expect(scope.runListImg.length).toBe(3);
            scope.uploadFile('pictures', {name: '.removePicture4'}, ['toto']);
            expect(scope.runListImg.length).toBe(4);
            scope.uploadFile('pictures', {name: '.removePicture5'}, ['toto']);
            expect(scope.runListImg.length).toBe(5);
            scope.uploadFile('pictures', {name: '.removePicture6'}, ['toto']);
            expect(scope.runListImg.length).toBe(6);
            scope.uploadFile('pictures', {name: '.removePicture7'}, ['toto']);
            expect(scope.runListImg.length).toBe(6);
            expect(scope.pictures.maxFile).toBe(1);
        });

        it ('Submit a run with pictures', function () {
            spyOn(location, 'path');
            spyOn(FileReader, 'readAsDataUrl').and.callFake(function() {
                return { then: function(callback) { return callback('File Read'); } }; });
            var newRun = {
                id: 3,
                name: 'Test',
                type: 'marathon',
                address_start: 'Tulles, France',
                date_start: '2015-09-15 00:00:00',
                time_start: '06:30',
                distances: '72km',
                elevations: '2500+',
                info: 'ksdjlsdjlf jsdlfjl sjdflj',
                is_active: 1
            };
            expect(scope.page).toEqual('Run');
            scope.uploadFile('pictures', {name: '.removePicture1'}, ['toto']);
            expect(scope.runListImg.length).toBe(1);
            scope.uploadFile('pictures', {name: '.removePicture2'}, ['toto']);
            expect(scope.runListImg.length).toBe(2);
            scope.uploadFile('pictures', {name: '.removePicture3'}, ['toto']);
            expect(scope.runListImg.length).toBe(3);
            scope.uploadFile('logo', '.uploadLogo', ['toto']);
            $httpBackend.flush();
            timeout.flush();
        });

        it('Should submit run with img',function () {
            spyOn(location, 'path');
            var newRun = {
                id: 3,
                name: 'Test',
                type: 'marathon',
                address_start: 'Tulles, France',
                date_start: '2015-09-15 00:00:00',
                time_start: '06:30',
                distances: '72km',
                elevations: '2500+',
                info: 'ksdjlsdjlf jsdlfjl sjdflj',
                is_active: 1
            };
            $httpBackend.flush();
            timeout.flush();
            scope.logo = {
                file: new Blob(['kdqjlqsjdl'])
            };
            scope.runListImg.push({file: new Blob(['lqksdjljqsl dj'])});
            scope.submitRun(scope.createRun, newRun);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/run');
        });
    });
});