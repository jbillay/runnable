/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('fileReader Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope,
        scope,
        eventListener,
        windowMock;

    describe('fileReader Service', function() {

        beforeEach(inject(function(fileReader, _$httpBackend_, $rootScope, $window){
            service = fileReader;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
            scope = rootScope.$new();
            windowMock = $window;
            eventListener = jasmine.createSpy();
            spyOn(windowMock, 'FileReader').and.returnValue({
                addEventListener: eventListener,
                readAsDataURL: function (file) {
                }
            });
        }));

        it('check the existence of fileReader', function() {
            expect(service).toBeDefined();
        });

        it('should read file', function () {
            // TODO: Need to find to put a file in a blob from Karma. Remove mock on FileReader !
            var message = null,
                file = '../api/fixtures/myruntrip.jpg',
                promise = service.readAsDataUrl(file, scope);

            promise.then(function(ret){
                message = ret;
            });
        });

        it('should delete a picture', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenGET('/api/user/remove/picture').respond({msg: 'userPictureRemoved', type: 'success'});

            var message = null;

            var promise = service.deletePicture('.jshintrc');

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message.msg).toEqual('userPictureRemoved');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to delete a picture', function () {
            $httpBackend.whenGET('/api/user/remove/picture').respond(500);

            var message = null;

            var promise = service.deletePicture('.jshintrc');

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should fail to get online file', function () {
            $httpBackend.whenGET('http://www.myruntrip.fr/logo.jpg').respond(500);
            var message = null;
            var promise = service.getOnlineFile('http://www.myruntrip.fr/logo.jpg');

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should get online file', function () {
            var file = new Blob();
            $httpBackend.whenGET('http://www.myruntrip.fr/logo.jpg').respond(file);
            var message = null;
            var promise = service.getOnlineFile('http://www.myruntrip.fr/logo.jpg');

            promise.then(function(ret) {
                console.log('Success: ' + ret);
                message = ret;
            }).catch(function(reason) {
                console.log('Error: ' + reason);
                message = reason;
            });

            $httpBackend.flush();
            // TODO: problem as the file is never read so promise never resolved
            //expect(message).toContain('error');
        });
    });
});