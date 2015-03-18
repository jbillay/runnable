var ddLibData = require('./ddLib-data');
var findClosestMatchIn = require('./findClosestMatchIn');

/**
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *@param options: {} options object from beginSearch.
 *
 *@return {} with closest match to attribute and the directive type it corresponds to.
 **/
module.exports = function(attribute, options) {
  var min_levDist = Infinity,
      match = '',
      dirType = '';

  options.directiveTypes.forEach(function(directiveType) {
    var isTag = attribute.charAt(0) === '*';
    var isCustomDir = directiveType === 'angular-custom-directives';
    if (!isTag || (isTag && isCustomDir)) {
      var directiveTypeData = ddLibData.directiveTypes[directiveType].directives;
      var tempMatch = findClosestMatchIn(directiveTypeData, attribute);
      if (tempMatch.min_levDist < options.tolerance && tempMatch.min_levDist < min_levDist) {
        match = tempMatch.match;
        dirType = directiveType;
        min_levDist = tempMatch.min_levDist;
      }
    }
  });
  return {
    match: match,
    directiveType: dirType
  };
};
