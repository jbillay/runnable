var getFunctionNames = require('../lib/getFunctionNames');

describe('getFunctionNames()', function() {
  it('should return an array of strings with the function names with in an expression', function() {
    var simple = getFunctionNames('simpleTest()');
    expect(simple[0]).toBe('simpleTest');

    var simple2 = getFunctionNames('4 + simpleTest()');
    expect(simple2[0]).toBe('simpleTest');

    var twoFunctions = getFunctionNames('one() / two()');
    expect(twoFunctions).toEqual(['one','two']);

    var paramFn = getFunctionNames('one("test") / two([1,3,4])/three()');
    expect(paramFn).toEqual(['one','two','three']);
  });
});