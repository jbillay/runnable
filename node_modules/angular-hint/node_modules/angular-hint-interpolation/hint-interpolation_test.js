'use strict'

var hintLog = angular.hint;

describe('hintInterpolation integration test', function() {
  var $rootScope, $compile;

  beforeEach(module('ngHintInterpolation'));
  beforeEach(inject(function(_$rootScope_, _$compile_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  it('should log a message using the hintLog pipeline when interpolation is undefined', function() {
    var html = '<a ng-href="{{data.results[0].urls.main_url}}"></a>';
    $compile(html)($rootScope);
    var log = hintLog.flush();
    expect(Object.keys(log['Interpolation'])).toEqual([' "data" was found to be undefined in ' +
      '"{{data.results[0].urls.main_url}}".']);
  });
});