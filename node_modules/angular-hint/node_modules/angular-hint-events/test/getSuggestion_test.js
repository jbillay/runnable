var getSuggestion = require('../lib/getSuggestion');

describe('getSuggestion()', function() {
  it('should return a string that is the closest match to the passed string in the array', function() {
    var res = getSuggestion('incremnts',['increment', 'count','constructor']);
    expect(res).toBe('increment');
  });
});