var getSuggestions = require('../lib/getSuggestions');

describe('getSuggestions()', function() {
  it('should return an array of objects with the proper match for each error', function() {
    var failedAttr = 'ng-ap';
    var options = {
      directiveTypes:['angular-default-directives'],
      tolerance: 4
    };
    var result = getSuggestions(failedAttr, options);
    expect(result.match).toBe('ng-app');
  });
});
