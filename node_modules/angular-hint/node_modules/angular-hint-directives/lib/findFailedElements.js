
var getFailedAttributesOfElement = require('./getFailedAttributesOfElement');

module.exports = function(scopeElements, options) {
  return scopeElements.map(getFailedAttributesOfElement.bind(null, options))
      .filter(function(x) {return x;});
};
