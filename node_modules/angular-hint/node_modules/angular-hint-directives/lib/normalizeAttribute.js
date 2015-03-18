/**
 *@param attribute: attribute name before normalization as string
 * e.g. 'data-ng-click', 'width', 'x:ng:src', etc.
 *
 *@return normalized attribute name
 **/
module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/,'').replace(/[:_]/g,'-');
};
