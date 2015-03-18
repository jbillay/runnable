var getFailedAttributes = require('./getFailedAttributes');
var findMissingAttrs = require('./findMissingAttrs');


/**
 *@description
 *Adds element tag name (DIV, P, SPAN) to list of attributes with '*' prepended
 *for identification later.
 *
 *@param options: {} options object from beginSearch
 *@param element: HTML element to check attributes of
 *
 *@return {} of html element and [] of failed attributes
 **/
module.exports = function(options, element) {
  if(element.attributes.length) {
    var eleName = element.nodeName.toLowerCase();
    var eleAttrs = Array.prototype.slice.call(element.attributes);
    eleAttrs.push({
      nodeName: '*'+eleName
    });
    var failedAttrs = getFailedAttributes(eleAttrs, options);
    var missingRequired = findMissingAttrs(eleName, eleAttrs);
    if(failedAttrs.length || missingRequired.length) {
      if(missingRequired.length) {
        failedAttrs.push({
          directiveType: 'angular-custom-directive',
          missing: missingRequired,
          typeError: 'missingrequired'
        });
      }
      return {
        domElement: element,
        data: failedAttrs
      };
    }
  }
};
