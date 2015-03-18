'use strict';

var hintLog = angular.hint;

describe('ddLib and Angular Integration Test', function() {

  beforeEach(module('ngHintDirectives'));
  beforeEach(inject(function(){
    hintLog.onMessage = jasmine.createSpy('onMessage');
  }));

  describe('Decorator: $rootScope', function() {
    var $rootScope, $compile;

    beforeEach(inject(function(_$rootScope_, _$compile_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
    }));

    it('should have no return no errors if there are none', function() {
      var html = '<div id="topTest"><div ng-click="">Testing</div><p ng-src="">Testing</p></div>';
      var element = angular.element(html);
      $compile(element)($rootScope);
      $rootScope.$apply();
      expect(hintLog.onMessage).not.toHaveBeenCalled();
    });


    it('should return the console.log the correct number of errors', function() {
      var html = '<div id="topTest"><div ng-cick="">Testing</div><p ng-src="">Testing</p></div>';
      var element = angular.element(html);
      $compile(element)($rootScope);
      $rootScope.$apply();
      expect(hintLog.onMessage).toHaveBeenCalledWith('##Directives## There was an AngularJS error in DIV element. Found incorrect attribute "ng-cick" try "ng-click".');
    });


    it('should ignore comment nodes', function() {
      var html = '<div id="topTest"><!-- ng-cick  this should not throw--></div>';
      var element = angular.element(html);
      $compile(element)($rootScope);
      expect(function() {
        $rootScope.$apply();
      }).not.toThrow();
    });

  });
  describe('angular.module Decorator', function () {
    it('should handle restrict regexp correctly', inject(function ($compile) {
      angular.module('testModule',[]).directive('testDirective', function() {
        return {
          restrict  :  "E"
        };
      });
      $compile('<div><div test-directive></div></div>');
      expect(hintLog.onMessage).toHaveBeenCalledWith('##Directives## There was an AngularJS error in DIV element. Attribute name "test-directive" is reserved for element names only.');
    }));

    it('should allow custom directives without "restrict"', inject(function ($compile) {
      angular.module('testModule',[]).directive('testDirective', function() {
        return {};
      });
      $compile('<div></div>');
      expect(hintLog.onMessage).not.toHaveBeenCalled();
    }));
  });

});

describe('logging through hintLog pipeline', function() {
  var $rootScope, $compile;
  beforeEach(module('ngHintDirectives'));

  beforeEach(inject(function(_$rootScope_, _$compile_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    hintLog.flush();
  }));

  it('should log messages to the pipeline about not found directives', inject(function($compile) {
    var html = '<div id="topTest"><div ng-cick="">Testing</div><p ng-src="">Testing</p></div>';
    var element = angular.element(html);
    $compile(element)($rootScope);
    $rootScope.$apply();
    var log = hintLog.flush();
    expect(Object.keys(log['Directives'])).toEqual([' There was an AngularJS error in DIV element. Found incorrect attribute "ng-cick" try "ng-click".']);
  }));


  it('should log messages to the pipeline about incorrectly used directives', inject(function($compile) {
    angular.module('testModule',[]).directive('testDirective', function() {
      return {
        restrict  :  'E'
      };
    });
    $compile('<div><div test-directive></div></div>');
    var log = hintLog.flush();
    expect(Object.keys(log['Directives'])).toEqual([ ' There was an AngularJS error in DIV element. Attribute name "test-directive" is reserved for element names only.' ]);
  }));


  it('should log messages to the pipeline about incorrectly named directives', inject(function($compile) {
    angular.module('testModule',[]).directive('testdirective', function() {
      return {
        restrict  :  'E'
      };
    });
    $compile('<test-directive></test-directive>');
    var log = hintLog.flush();
    expect(Object.keys(log['Directives'])).toEqual([ ' Directive "testdirective" should have proper namespace try adding a prefix and/or using camelcase.' ]);
  }));


  it('should log messages to the pipeline about the deprecated use of replace', inject(function($compile) {
    angular.module('testModule',[]).directive('testDirective', function() {
      return {
        replace: true,
        restrict  :  'E'
      };
    });
    $compile('<test-directive></test-directive>');
    var log = hintLog.flush();
    expect(Object.keys(log['Directives'])).toEqual([ ' The use of "replace" in directive factories is deprecated, and it was found in "testDirective".' ]);
  }));
});
