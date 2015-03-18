var concatParts = require('../lib/concatParts');

describe('concatParts()', function() {
  it('should return the correct grouping of parts based on concatLength', function() {
    var toSend = ['data','name','first'];
    var result = concatParts(toSend, 1);
    expect(result).toBe('data.name');
    toSend = ['data','name[0]','first'];
    result = concatParts(toSend, 2);
    expect(result).toBe('data.name[0].first');
  });
});