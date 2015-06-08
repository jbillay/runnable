'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
    var $compile,
        $rootScope;

    beforeEach(module('runnable'));

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('Should compare to', function() {
        $rootScope.passwords = {
            new: 'test',
            newConfirm: 'test'
        };
        var element = $compile('<input ng-model="passwords.new"><input ng-model="passwords.newConfirm" compare-to="passwords.new">')($rootScope);
        $rootScope.$digest();
        expect(element[1].outerHTML).toContain('ng-valid-compare-to');
    });

    it('Should select a file', function() {
        var target = {
                    files: ['toto']
            };
        $rootScope.getFile = function (file) { expect(file).toEqual('toto'); };
        var element = $compile('<input type="file" ng-file-select="onFileSelect($files)">')($rootScope);
        $rootScope.$digest();
        element.triggerHandler({type: 'change', target: target});
    });

    it('Should submit a form', function() {
        var element = angular.element('<form name="testForm" ng-form-commit></form>');
        $compile(element)($rootScope);
        var form = $rootScope.testForm;
        spyOn(form, 'commit');
        $rootScope.$digest();
        form.commit();
        expect(form.commit).toHaveBeenCalled();
    });
});