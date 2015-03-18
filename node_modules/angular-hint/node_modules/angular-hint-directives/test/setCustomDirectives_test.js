var setCustomDirectives = require('../lib/setCustomDirectives');
var ddLibData = require('../lib/ddLib-data');

describe('setCustomDirectives()', function() {
  it('should set directives passed as custom directives', function() {
    var customDirs = [{directiveName: 'testDir'}];
    setCustomDirectives(customDirs);
    var result = ddLibData.directiveTypes['angular-custom-directives'].directives['test-dir'];
    expect(result).toEqual({directiveName: 'testDir'});
  });
});
