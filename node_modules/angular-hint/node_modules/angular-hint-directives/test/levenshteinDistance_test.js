var levenshteinDistance = require('../lib/levenshtein');

describe('levenshteinDistance()', function() {
  it('should only accept strings to be passed',function() {
    expect(function() {
      levenshteinDistance(null, null);
    }).toThrow('Function must be passed two strings, given: object and object.');
    expect(function() {
      levenshteinDistance(2, 6);
    }).toThrow('Function must be passed two strings, given: number and number.');
    expect(function() {
      levenshteinDistance(undefined,undefined);
    }).toThrow('Function must be passed two strings, given: undefined and undefined.');
  });
  it('should return the proper levenshtein distance between two strings', function() {
    var test1 = levenshteinDistance('nf-ap','ng-app');
    var test2 = levenshteinDistance('','');
    var bound1 = levenshteinDistance('ng-onmouseo','ng-onmouseover');
    var bound2 = levenshteinDistance('asdf','qwertyuiop');
    var bound3 = levenshteinDistance('ng-href','ng-href');
    expect(test1).toBe(2);
    expect(test2).toBe(0);
    expect(bound1).toBe(3);
    expect(bound2).toBe(10);
    expect(bound3).toBe(0);
  });
});
