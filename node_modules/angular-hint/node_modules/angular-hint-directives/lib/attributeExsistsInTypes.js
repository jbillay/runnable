var ddLibData = require('./ddLib-data');

/**
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *@param options: {} options object from beginSearch.
 *
 *@description attribute exsistance in the types of directives/attibutes (html, angular core, and
 * angular custom) and checks the restrict property of values matches its use.
 *
 *@return {} with attribute exsistance and wrong use e.g. restrict property set to elements only.
 **/
module.exports = function(attribute, options) {
  var anyTrue = false,
      wrongUse = '',
      directive,
      restrictProp;

  options.directiveTypes.forEach(function(dirType) {
    var isTag = attribute.charAt(0) === '*';
    var isCustomDir = dirType === 'angular-custom-directives';
    if(!isTag) {
      directive = ddLibData.directiveTypes[dirType].directives[attribute] || '';
      restrictProp = directive.restrict || directive;
      if(restrictProp) {
        if(restrictProp.indexOf('E') > -1 && restrictProp.indexOf('A') < 0) {
          wrongUse = 'element';
        }
        if(restrictProp.indexOf('C') > -1 && restrictProp.indexOf('A') < 0) {
          wrongUse = (wrongUse) ? 'element and class' : 'class';
        }
        anyTrue = anyTrue || true;
      }
    }
    else if(isTag && isCustomDir){
      directive = ddLibData.directiveTypes[dirType].directives[attribute.substring(1)] || '';
      restrictProp = directive.restrict || directive;
      anyTrue = anyTrue || true;
      if(restrictProp && restrictProp.indexOf('A') > -1 && restrictProp.indexOf('E') < 0) {
        wrongUse = 'attribute';
      }
    }
  });
  var typeError = wrongUse? 'wronguse':'' || !anyTrue ? 'nonexsisting' : '' || '';
  return {exsists: anyTrue, wrongUse: wrongUse, typeError: typeError};
};
