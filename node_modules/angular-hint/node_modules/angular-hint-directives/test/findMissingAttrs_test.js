var findMissingAttrs = require('../lib/findMissingAttrs');
var ddLibData = require('../lib/ddLib-data');

describe('findMissingAttrs()', function(){
  it('should identify that there are no missing required attributes', function() {
    var attrs = [{nodeName: 'ng-click'}, {nodeName: 'a'}];
    ddLibData.directiveTypes['angular-custom-directives'].directives['test'] =
      {
        require: [{directiveName: 'a', restrict: 'A'}]
      };
    var result = findMissingAttrs('test',attrs);
    expect(result).toEqual([]);
  });
  it('should identify missing required attributes', function(){
    var attrs = [{nodeName: 'ng-click'}, {nodeName: 'id'}];
    ddLibData.directiveTypes['angular-custom-directives'].directives['test'] =
      {
        require: [{directiveName: 'a', restrict: 'A'}]
      };
    var result = findMissingAttrs('test',attrs);
    expect(result).toEqual(['a']);
  });
});
