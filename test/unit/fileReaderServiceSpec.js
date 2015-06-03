/**
 * Created by jeremy on 22/05/15.
 */
'use strict';

describe('fileReader Service', function() {

    // load modules
    beforeEach(module('runnable.services'));

    var service,
        $httpBackend,
        rootScope;

    describe('fileReader Service', function() {

        beforeEach(inject(function(fileReader, _$httpBackend_, $rootScope){
            service = fileReader;
            $httpBackend = _$httpBackend_;
            rootScope = $rootScope;
        }));

        it('check the existence of fileReader', function() {
            expect(service).toBeDefined();
        });

        it('should save a picture', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenPOST('/api/user/picture').respond('userPictureSaved');

            var message = null;

            var promise = service.savePicture('.jshintrc');

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('userPictureSaved');
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should failed to save a picture', function () {
            $httpBackend.whenPOST('/api/user/picture').respond(500);

            var message = null;

            var promise = service.savePicture('.jshintrc');

            promise.then(function(ret) {
                message = ret;
            }).catch(function(reason) {
                message = reason;
            });

            $httpBackend.flush();
            expect(message).toContain('error');
        });

        it('should delete a picture', function () {
            spyOn(rootScope, '$broadcast').and.callThrough();
            $httpBackend.whenGET('/api/user/remove/picture').respond('userPictureRemoved');

            var message = null;

            var promise = service.deletePicture('.jshintrc');

            promise.then(function(ret){
                message = ret;
            });

            $httpBackend.flush();
            expect(message).toEqual('userPictureRemoved');
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
    });
});