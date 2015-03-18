var getValidProps = require('../lib/getValidProps');

describe('getValidProps()', function() {
  it('should return an array of valid function and property names on the scope to check', function() {
    var res = getValidProps({
      $$childTail: null,
      $$watchers: [],
      increment: function(){},
      count: 0
    });
    expect(res[0]).toBe('increment');
  });
});