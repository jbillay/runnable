
var formatResults = require('./formatResults');
var findFailedElements = require('./findFailedElements');
var setCustomDirectives = require('./setCustomDirectives');
var defaultTypes = [
  'html-directives',
  'angular-default-directives',
  'angular-custom-directives'
];


/**
 *
 *@param scopeElements: [] of HTML elements to be checked for incorrect attributes
 *@param customDirectives: [] of custom directive objects from $compile decorator
 *@param options: {} of options for app to run with:
 *    options.tolerance: Integer, maximum Levenshtein Distance to be allowed for misspellings
 *    options.directiveTypes: [] of which type of directives/attributes to search through
 **/
module.exports = function(scopeElements, customDirectives, options) {
  if(!Array.isArray(scopeElements)) {
    throw new Error('Function search must be passed an array.');
  }
  options = options || {};
  options.directiveTypes = options.directiveTypes || defaultTypes;
  options.tolerance = options.tolerance || 4;
  if(customDirectives && customDirectives.length){
    setCustomDirectives(customDirectives);
  }
  var failedElements = findFailedElements(scopeElements, options);
  formatResults(failedElements);
};
