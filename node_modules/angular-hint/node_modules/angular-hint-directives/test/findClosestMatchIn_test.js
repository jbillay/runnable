var findClosestMatchIn = require('../lib/findClosestMatchIn');

describe('findClosestMatchIn()', function() {
  it('should throw if passed undefined or null', function() {
    expect(function() {
      findClosestMatchIn({a: '',b: ''},null);
    }).toThrow('Function must be passed a string as second parameter.');
    expect(function() {
      findClosestMatchIn({a: ''},undefined);
    }).toThrow('Function must be passed a string as second parameter.');
    expect(function() {
      findClosestMatchIn('','toPass');
    }).toThrow('Function must be passed a defined object as first parameter.');
  });
  it('should find the closest match from list of given attributes', function() {
    var directiveTypeData = {'ng-src': 'ng-src','ng-app': 'ng-app','ng-click': 'ng-click'};
    var attribute = 'ng-ap';
    var result = findClosestMatchIn(directiveTypeData,attribute);
    expect(result.match).toBe('ng-app');
  });
});
