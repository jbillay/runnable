var addSuggestions = require('../lib/addSuggestions');

describe('addSuggestions()', function() {
  it('should return an array of objects with the suggestion as added properties for each object', function() {
    var scope = {
      $$childTail: null,
      $$watchers: [],
      incrementCount: function(){},
      count: 0
    };
    var messages = [{boundFunc: 'incrementConts', scope: scope}];
    var res = addSuggestions(messages);
    var expected = messages;
    expected['match'] = 'incrementCount';
    expect(res).toEqual(expected);
  });
});