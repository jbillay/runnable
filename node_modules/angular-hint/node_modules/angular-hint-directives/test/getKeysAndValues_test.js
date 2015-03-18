var getKeysAndValues = require('../lib/getKeysAndValues');

describe('getKeysAndValues()',function() {
  it('should get all directives created by isolated scope in directive factory', function() {
    var factoryString = 'scope:{url:"="}';
    var result = getKeysAndValues(factoryString);
    expect(result[0].directiveName).toBe('url');

    factoryString = 'scope:{url:"=notUrl"}';
    result = getKeysAndValues(factoryString);
    expect(result[0].directiveName).toBe('notUrl');

    factoryString = 'scope:{url:"=", id:"@"}';
    result = getKeysAndValues(factoryString);
    expect(result[1].directiveName).toBe('id');

    factoryString = 'scope:{url:"=a", id:"@b"}';
    result = getKeysAndValues(factoryString);
    expect(result[0].directiveName).toBe('a');
    expect(result[1].directiveName).toBe('b');
  });
});
