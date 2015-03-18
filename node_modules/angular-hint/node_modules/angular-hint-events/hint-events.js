'use strict';

var hintLog = angular.hint = require('angular-hint-log');
var ngEventDirectives = require('./lib/getEventDirectives')();

var getEventAttribute = require('./lib/getEventAttribute');
var getFunctionNames = require('./lib/getFunctionNames');
var formatResults = require('./lib/formatResults');

angular.module('ngHintEvents',[])
  .config(['$provide',function($provide) {

    for(var directive in ngEventDirectives) {

      var dirName = ngEventDirectives[directive]+'Directive';

      $provide.decorator(dirName, ['$delegate', '$timeout', '$parse',
        function($delegate, $timeout, $parse) {

          var original = $delegate[0].compile, falseBinds = [], messages = [];

          $delegate[0].compile = function(element, attrs, transclude) {
            var eventAttrName = getEventAttribute(attrs.$attr);
            var fn = $parse(attrs[eventAttrName]);
            var messages = [];
            return function ngEventHandler(scope, element, attrs) {
              for(var attr in attrs.$attr) {
                var boundFuncs = getFunctionNames(attrs[attr]);
                boundFuncs.forEach(function(boundFn) {
                  if(ngEventDirectives[attr] && !(boundFn in scope)) {
                    messages.push({
                      scope: scope,
                      element:element,
                      attrs: attrs,
                      boundFunc: boundFn
                    });
                  }
                });
              }
              element.on(eventAttrName.substring(2).toLowerCase(), function(event) {
                scope.$apply(function() {
                  fn(scope, {$event:event});
                });
              });
              formatResults(messages);
            };
          };
          return $delegate;
      }]);
    }
  }]);