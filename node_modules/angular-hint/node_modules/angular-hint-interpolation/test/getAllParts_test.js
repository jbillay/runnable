var getAllParts = require('../lib/getAllParts');

describe('getAllParts()', function() {
  //E.g. the parts in "hello, {{data.user[1].name}}" are data, data.user[1], &  data.user[1].name
  it('should return an array with all parts of the interpolation', function() {
    var toSend = 'Hello, {{data.firstName + data.lastName}}';
    var parts = getAllParts(toSend, '{{','}}');
    var expected = ['data','data.firstName','data.lastName'];
    expect(parts).toEqual(expected);
    toSend = 'Hello, {{3 + data.age}}';
    parts = getAllParts(toSend, '{{','}}');
    expected = ['data','data.age'];
    expect(parts).toEqual(expected);
  });
  it('should throw if start and end symbol are not found', function() {
    var toSend = 'Hello, {{name]]';
    expect(function(){
      getAllParts(toSend, '{{','}}');
    }).toThrow
      ('Missing start or end symbol in interpolation. Start symbol: "{{" End symbol: "}}"');
  });
});