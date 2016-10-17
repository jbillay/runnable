'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableRunUpdateController for user allowed', function(){
        var scope, rootScope, timeout, location, ctrl, ctrlMain, mapAPI, $httpBackend, form, FileReader;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location,
                                   $controller, GoogleMapApi, $compile, _fileReader_) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $routeParams.runId = 4;
            timeout = $timeout;
            location = $location;
            mapAPI = GoogleMapApi;
            FileReader = _fileReader_;
            $httpBackend.whenGET('/api/run/4').respond({ id: 4, name: 'Maxicross', slug: 'maxicross', lat: '43.2939345', lng: '5.386939099999999', type: 'trail', address_start: 'Bouffémont, France', date_start: '2015-02-02 00:00:00', time_start: '09:15', distances: '15k - 30k - 7k', elevations: '500+ - 1400+', info: 'http://www.maxicross.fr', pictures: [], sticker: null, is_active: 1, UserId: 4, PartnerId: null, createdAt: '2016-08-07T12:15:00.000Z', updatedAt: '2016-08-07T12:15:00.000Z'});
            $httpBackend.whenGET('http://res.cloudinary.com/myruntrip/image/upload/v1470754457/Run_4_Picture_38_development.jpg').respond(200);
            $httpBackend.whenGET('http://res.cloudinary.com/myruntrip/image/upload/v1470754457/Run_4_Picture_39_development.jpg').respond(200);
            $httpBackend.whenPUT('/api/run').respond({msg: 'runUpdated', type: 'success'});
            $httpBackend.whenGET('/api/user/me').respond({ id: 1, firstname: 'Jeremy', lastname: 'Billay', address: 'Saint-Germain-en-Laye', phone: '0689876547', email: 'jbillay@gmail.com', itra: null, isActive: 1, role: 'admin', picture: null });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);

            form = angular.element('<form name="updateRun" novalidate></form>');
            form.appendTo(document.body);
            form = $compile(form)(scope);
            scope.$digest();

            ctrlMain = $controller('RunnableMainController', {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunUpdateController', {$rootScope: rootScope, $scope: scope, $location: location, $timeout: timeout, 'GoogleMapApi': mapAPI, fileReader: FileReader});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            expect(scope.calendar.opened).not.toBeTruthy();
        });

        it ('Try to open calendar', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            scope.calendar.open(e);
            expect(scope.calendar.opened).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Get location', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            scope.getLocation('Paris, France');
        });

        it ('Get selected address', function () {
            spyOn(mapAPI, 'selectedAddress');
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            scope.selectedAddress('Paris, France');
            expect(mapAPI.selectedAddress).toHaveBeenCalled();
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
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            scope.submitRun(scope.updateRun, newRun);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/run');
        });

        it ('Should test all uploadFile options', function () {
            spyOn(FileReader, 'readAsDataUrl').and.callFake(function() {
                return { then: function(callback) { return callback('File Read'); } }; });
            $httpBackend.flush();
            timeout.flush();
            scope.uploadFile('logo', {name: '.uploadLogo'}, ['toto']);
            expect(scope.logo.errFile).toBeNull();
            scope.uploadFile('logo', null, ['toto']);
            expect(scope.logo.errFile).toBe('toto');
            scope.uploadFile('pictures', {name: '.uploadPicture'}, ['toto']);
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
            $httpBackend.flush();
            timeout.flush();
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
            $httpBackend.flush();
            timeout.flush();
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
            $httpBackend.flush();
            timeout.flush();
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
            scope.submitRun(scope.updateRun, newRun);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/run');
        });
    });

    describe('RunnableRunUpdateController for user allowed with image in the run', function(){
        var scope, rootScope, timeout, location, ctrl, ctrlMain, mapAPI, $httpBackend, form, FileReader;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location,
                                   $controller, GoogleMapApi, $compile, _fileReader_, $q) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $routeParams.runId = 4;
            timeout = $timeout;
            location = $location;
            mapAPI = GoogleMapApi;
            FileReader = _fileReader_;
            $httpBackend.whenGET('/api/run/4').respond({
                id: 4,
                name: 'Maxicross',
                slug: 'maxicross',
                lat: '43.2939345',
                lng: '5.386939099999999',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'http://www.maxicross.fr',
                pictures: ['http://www.myruntrip.com/img-3.jpg', 'http://www.myruntrip.com/img-5.jpg'],
                sticker: 'http://www.myruntrip.com/img-4.jpg',
                is_active: 1,
                UserId: 1,
                PartnerId: null,
                createdAt: '2016-08-07T12:15:00.000Z',
                updatedAt: '2016-08-07T12:15:00.000Z'
            });
            $httpBackend.whenPUT('/api/run').respond({msg: 'runUpdated', type: 'success'});
            $httpBackend.whenGET('/api/user/me').respond({
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'Saint-Germain-en-Laye',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                itra: null,
                isActive: 1,
                role: 'user',
                picture: null
            });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenGET('http://www.myruntrip.com/img-4.jpg').respond(200);
            $httpBackend.whenGET('http://www.myruntrip.com/img-3.jpg').respond(200);
            $httpBackend.whenGET('http://www.myruntrip.com/img-5.jpg').respond(200);

            form = angular.element('<form name="updateRun" novalidate></form>');
            form.appendTo(document.body);
            form = $compile(form)(scope);
            scope.$digest();

            spyOn(FileReader, 'getOnlineFile').and.callFake(function() {
                var deferred = $q.defer();
                deferred.resolve({src: 'filePath', file: 'TOTO'});
                return deferred.promise;
            });

            ctrlMain = $controller('RunnableMainController', {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunUpdateController',
                {$rootScope: rootScope, $scope: scope, $location: location, $timeout: timeout, 'GoogleMapApi': mapAPI, fileReader: FileReader});
        }));

        it ('Start controller', function () {
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            expect(scope.calendar.opened).not.toBeTruthy();
            expect(scope.runListImg.length).toBe(2);
            expect(scope.logo.file).toEqual('TOTO');
        });
    });

    describe('RunnableRunUpdateController for user not logged', function(){
        var scope, rootScope, timeout, location, ctrl, ctrlMain, mapAPI, $httpBackend, form, FileReader;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location,
                                   $controller, GoogleMapApi, $compile, _fileReader_) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $routeParams.runId = 4;
            timeout = $timeout;
            location = $location;
            mapAPI = GoogleMapApi;
            FileReader = _fileReader_;
            $httpBackend.whenGET('/api/run/4').respond({
                id: 4,
                name: 'Maxicross',
                slug: 'maxicross',
                lat: '43.2939345',
                lng: '5.386939099999999',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'http://www.maxicross.fr',
                pictures: [],
                sticker: null,
                is_active: 1,
                UserId: 1,
                PartnerId: null,
                createdAt: '2016-08-07T12:15:00.000Z',
                updatedAt: '2016-08-07T12:15:00.000Z'
            });
            $httpBackend.whenGET('/api/user/me').respond(500);
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(500);
            $httpBackend.whenGET('http://www.myruntrip.com/img-4.jpg').respond(200);
            $httpBackend.whenGET('http://www.myruntrip.com/img-3.jpg').respond(200);
            $httpBackend.whenGET('http://www.myruntrip.com/img-5.jpg').respond(200);

            form = angular.element('<form name="updateRun" novalidate></form>');
            form.appendTo(document.body);
            form = $compile(form)(scope);
            scope.$digest();

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunUpdateController',
                {$rootScope: rootScope, $scope: scope, $location: location, $timeout: timeout, 'GoogleMapApi': mapAPI, fileReader: FileReader});
        }));

        it ('Start controller', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            expect(scope.calendar.opened).not.toBeTruthy();
            expect(location.path).toHaveBeenCalledWith('/run');
        });
    });
    describe('RunnableRunUpdateController for user not owner of the run', function(){
        var scope, rootScope, timeout, location, ctrl, ctrlMain, mapAPI, $httpBackend, form, FileReader;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $timeout, $location,
                                   $controller, GoogleMapApi, $compile, _fileReader_) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $routeParams.runId = 4;
            timeout = $timeout;
            location = $location;
            mapAPI = GoogleMapApi;
            FileReader = _fileReader_;
            $httpBackend.whenGET('/api/run/4').respond({
                id: 4,
                name: 'Maxicross',
                slug: 'maxicross',
                lat: '43.2939345',
                lng: '5.386939099999999',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'http://www.maxicross.fr',
                pictures: [],
                sticker: null,
                is_active: 1,
                UserId: 2,
                PartnerId: null,
                createdAt: '2016-08-07T12:15:00.000Z',
                updatedAt: '2016-08-07T12:15:00.000Z'
            });
            $httpBackend.whenGET('/api/user/me').respond({
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'Saint-Germain-en-Laye',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                itra: null,
                isActive: 1,
                role: 'user',
                picture: null
            });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenGET('http://www.myruntrip.com/img-4.jpg').respond(200);
            $httpBackend.whenGET('http://www.myruntrip.com/img-3.jpg').respond(200);
            $httpBackend.whenGET('http://www.myruntrip.com/img-5.jpg').respond(200);

            form = angular.element('<form name="updateRun" novalidate></form>');
            form.appendTo(document.body);
            form = $compile(form)(scope);
            scope.$digest();

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrl = $controller('RunnableRunUpdateController',
                {$rootScope: rootScope, $scope: scope, $location: location, $timeout: timeout, 'GoogleMapApi': mapAPI, fileReader: FileReader});
        }));

        it ('Start controller', function () {
            spyOn(location, 'path');
            expect(scope.page).toEqual('Run');
            expect(scope.runId).toBe(4);
            $httpBackend.flush();
            timeout.flush();
            expect(scope.currentRun.name).toEqual('Maxicross');
            expect(scope.calendar.opened).not.toBeTruthy();
            expect(location.path).toHaveBeenCalledWith('/run');
        });
    });
});