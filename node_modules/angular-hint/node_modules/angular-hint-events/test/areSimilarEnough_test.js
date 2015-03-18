var areSimilarEnough = require('../lib/areSimilarEnough');

describe('areSimilarEnough()', function() {
  it('should return whether a passed string is close enough to another passed string', function() {
    var res = areSimilarEnough('tests','tsts'); //first string longer
    expect(res).toBe(true);

    res = areSimilarEnough('tsts','test'); //second string longer
    expect(res).toBe(true);

    res = areSimilarEnough('asdf','tstd'); // half letters matched
    expect(res).toBe(false);

    res = areSimilarEnough('wayTooLongOfADifference','yeahNotClose'); // string length difference > 2
    expect(res).toBe(false);
  });
});