var formatResults = require('../lib/formatResults');

describe('formatResults()', function() {
  it('should display the correct message with respect to the correction found', function() {
    var failedElements = [{
      domElement:{id: '',nodeName: 'HTML'},
      data: [{
        directiveType: 'angular-default-directives',
        error: 'ng-ap',
        match: 'ng-app',
        typeError: 'nonexsisting'
      }]
    }];
    formatResults(failedElements);
    var log = angular.hint.flush();
    var display = [' There was an AngularJS error in HTML element. Found incorrect '+
      'attribute "ng-ap" try "ng-app".'];
    expect(Object.keys(log['Directives'])).toEqual(display);
  });
});
