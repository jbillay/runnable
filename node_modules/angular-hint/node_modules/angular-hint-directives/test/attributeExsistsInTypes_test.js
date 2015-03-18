
var attributeExsistsInTypes = require('../lib/attributeExsistsInTypes');
var ddLibData = require('../lib/ddLib-data');

describe('attributeExsistsInTypes', function() {
  var options = {
    directiveTypes:['angular-default-directives','html-directives','angular-custom-directives'],
    tolerance: 4
  };
  it('should identify attributes/directives that do not exsist', function() {
    var attrs = ['thisCouldntEvenBeReal','ng-clic',''];

    var result = attributeExsistsInTypes(attrs[0],options);
    expect(result.typeError).toBe('nonexsisting');
    result = attributeExsistsInTypes(attrs[1],options);
    expect(result.typeError).toBe('nonexsisting');
    result = attributeExsistsInTypes(attrs[2],options);
    expect(result.typeError).toBe('nonexsisting');
  });
  it('should identify if attribute directives are used incorrectly', function() {
    ddLibData.directiveTypes['angular-default-directives'].directives.fake = 'E';
    ddLibData.directiveTypes['angular-default-directives'].directives.fake2 = 'C';
    var result = attributeExsistsInTypes('fake',options);
    expect(result.typeError).toBe('wronguse');
    var result = attributeExsistsInTypes('fake2',options);
    expect(result.wrongUse).toBe('class');
  });
  it('should identify if element directives are used incorrectly', function() {
    ddLibData.directiveTypes['angular-custom-directives'].directives.fake = 'A';
    var result = attributeExsistsInTypes('*fake',options);
    expect(result.wrongUse).toBe('attribute');
  });
});
