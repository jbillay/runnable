var getEventAttribute = require('../lib/getEventAttribute');

describe('getEventAttribute()', function() {
  it('should return a string name of an ngEventDirective in camel case', function() {
    var res = getEventAttribute({'id':'id', 'ngClick':'ngClick', 'width':'width'})
    expect(res).toBe('ngClick');
  });
});