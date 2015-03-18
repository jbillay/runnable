
var getFailedAttributes = require('../lib/getFailedAttributes');

describe('getFailedAttributes()', function() {
  var options = {
    directiveTypes:['angular-default-directives','html-directives'],
    tolerance: 4
  };
  it('should not find anything if nothing is wrong', function() {
    var elementToTest = [{nodeName: 'id'}, {nodeName: 'ng-href'}, {nodeName: 'ng-show'}];
    var results = getFailedAttributes(elementToTest,options);
    expect(results.length).toBe(0);
  });
  it('should find misspelled attributes in element', function() {
    var elementToTest = [{nodeName: 'ng-ap'}, {nodeName: 'ng-hef'}];
    var results = getFailedAttributes(elementToTest,options);
    expect(results[0].error).toBe('ng-ap');
    expect(results[1].error).toBe('ng-hef');
  });

  it('should identify mutually exclusive pairs of attributes', function() {
    var elementToTest = [{nodeName: 'ng-show'}, {nodeName: 'ng-hide'}];
    var results = getFailedAttributes(elementToTest,options);
    expect(results[0].typeError).toBe('mutuallyexclusive');

    elementToTest = [{nodeName: 'ng-show'}, {nodeName: 'ng-click'}];
    results = getFailedAttributes(elementToTest,options);
    expect(results.length).toBe(0);
  });

  it('should identify html event attributes', function() {
     var elementToTest = [{nodeName: 'onclick'}];
     var results = getFailedAttributes(elementToTest,options);
     expect(results[0].typeError).toBe('ngevent');
  });
});
