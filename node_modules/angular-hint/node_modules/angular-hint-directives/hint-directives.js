'use strict';

var hintLog = angular.hint = require('angular-hint-log');
var ddLibData = require('./lib/ddLib-data');

var RESTRICT_REGEXP = /restrict\s*:\s*['"](.+?)['"]/;
var customDirectives = [];
var dasherize = require('dasherize');
var search = require('./lib/search');
var checkPrelimErrors = require('./lib/checkPrelimErrors');
var getKeysAndValues = require('./lib/getKeysAndValues');
var defaultDirectives = ddLibData.directiveTypes['angular-default-directives'].directives;
var htmlDirectives = ddLibData.directiveTypes['html-directives'].directives;

angular.module('ngHintDirectives', ['ngLocale'])
  .config(['$provide', function($provide) {
    $provide.decorator('$compile', ['$delegate', function($delegate) {
      return function(elem) {
        elem = angular.element(elem);
        for(var i = 0; i < elem.length; i+=2){
          if(elem[i].getElementsByTagName){
            var toSend = Array.prototype.slice.call(elem[i].getElementsByTagName('*'));
            search(toSend, customDirectives);
          }
        }
        return $delegate.apply(this, arguments);
      };
    }]);
  }]);


angular.module('ngLocale').config(function($provide) {
  var originalProvider = $provide.provider;
  $provide.provider = function(token, provider) {
    provider = originalProvider.apply($provide, arguments);
    if (token === '$compile') {
      var originalProviderDirective = provider.directive;
      provider.directive = function(dirsObj) {
        for(var prop in dirsObj){
          var propDashed = dasherize(prop);
          if(isNaN(+propDashed) &&
              !defaultDirectives[propDashed] &&
              !htmlDirectives[propDashed]) {
            var matchRestrict = dirsObj[prop].toString().match(RESTRICT_REGEXP);
            ddLibData.directiveTypes['angular-default-directives']
                .directives[propDashed] = (matchRestrict && matchRestrict[1]) || 'ACME';
          }
        }
        return originalProviderDirective.apply(this, arguments);
      };
    }
    return provider;
  };
});

var originalAngularModule = angular.module;
angular.module = function() {
  var module = originalAngularModule.apply(this, arguments);
  var originalDirective = module.directive;
  module.directive = function(directiveName, directiveFactory) {
    var originalDirectiveFactory = typeof directiveFactory === 'function' ? directiveFactory :
        directiveFactory[directiveFactory.length - 1];
    var factoryStr = originalDirectiveFactory.toString();

    checkPrelimErrors(directiveName,factoryStr);

    var pairs = getKeysAndValues(factoryStr);
    pairs.map(function(pair){customDirectives.push(pair);});

    var matchRestrict = factoryStr.match(RESTRICT_REGEXP);
    var restrict = (matchRestrict && matchRestrict[1]) || 'A';
    var directive = {directiveName: directiveName, restrict: restrict,  require:pairs};
    customDirectives.push(directive);

    return originalDirective.apply(this, arguments);
  };
  return module;
};
