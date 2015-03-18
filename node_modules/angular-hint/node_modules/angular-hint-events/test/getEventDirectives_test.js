var getEventDirectives = require('../lib/getEventDirectives');

describe('getEventDirectives()', function() {
  it('should return a hash of Angular event directives', function() {
    var dirs = getEventDirectives();
    expect(dirs['ngClick']).toBe('ngClick');
    expect(dirs['ngMouseover']).toBe('ngMouseover');
  });
});