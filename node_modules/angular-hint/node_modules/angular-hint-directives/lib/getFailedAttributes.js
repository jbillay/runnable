var normalizeAttribute = require('./normalizeAttribute');
var ddLibData = require('./ddLib-data');
var isMutExclusiveDir = require('./isMutExclusiveDir');
var hasMutExclusivePair = require('./hasMutExclusivePair');
var attributeExsistsInTypes = require('./attributeExsistsInTypes');
var getSuggestions = require('./getSuggestions');

/**
 *@param attributes: [] of attributes from element (includes tag name of element, e.g. DIV, P, etc.)
 *@param options: {} options object from beginSearch
 *
 *@return [] of failedAttributes with their respective suggestions and directiveTypes
 **/
module.exports = function(attributes, options) {
  var failedAttrs = [], mutExPairFound = false;
  for (var i = 0; i < attributes.length; i++) {
    var attr = normalizeAttribute(attributes[i].nodeName);
    var dirVal = ddLibData.directiveTypes['html-directives'].directives[attr] || '';
    if (dirVal.indexOf('!') > -1) {
      failedAttrs.push({
        error: attr,
        directiveType: 'html-directives',
        typeError: 'ngevent'
      });
      continue;
    }
    if (!mutExPairFound && isMutExclusiveDir(attr) && hasMutExclusivePair(attr, attributes)) {
      failedAttrs.push({
        error: attr,
        directiveType: 'angular-default-directives',
        typeError: 'mutuallyexclusive'
      });
      mutExPairFound = true;
      continue;
    }
    var result = attributeExsistsInTypes(attr,options);
    var suggestion = result.typeError === 'nonexsisting' ?
        getSuggestions(attr, options) : {match: ''};

    if (result.typeError) {
      failedAttrs.push({
        match: suggestion.match || '',
        wrongUse: result.wrongUse || '',
        error: attr,
        directiveType: suggestion.directiveType || 'angular-custom-directives',
        typeError: result.typeError
      });
    }
  }
  return failedAttrs;
};
