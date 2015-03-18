var hintLog = angular.hint;
describe('controllerDecorator', function() {
  var $controller;
  beforeEach(module('ngHintControllers'));
  beforeEach(function(){
    angular.version.minor = 2;
  });
  beforeEach(inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  it('should detect if a controller is instantiated on the window', function() {
    spyOn(hintLog, 'logMessage');
    var controllerMock = function() {
        var element = document.createElement('a');
        element.innerHTML = 'testValue';
    };
    var sampleControl = $controller(controllerMock);
    expect(hintLog.logMessage).toHaveBeenCalledWith('##Controllers## It is against Angular best practices to instantiate a controller on the window. This behavior is deprecated in Angular 1.3.0');
  });


  it('should explain global controller deprecation for versions greater than 1.2.x', function() {
    angular.version.minor = 3;
    spyOn(hintLog, 'logMessage');
    var controllerMock = function() {
        var element = document.createElement('a');
        element.innerHTML = 'testValue';
    };
    var sampleControl = $controller(controllerMock);
    expect(hintLog.logMessage).toHaveBeenCalledWith('##Controllers## Global instantiation of controllers was ' +
      'deprecated in Angular 1.3.0. Define the controller on a module.');
  });


  it('should not log a message if the controller is on the local scope', function() {
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleController', function() {});
    var ctrl = $controller('SampleController');
    expect(hintLog.logMessage).not.toHaveBeenCalledWith('##Controllers## It is against Angular best '
      + 'practices to instantiate a controller on the window. This behavior is deprecated in Angular'
      + ' 1.3.0');
  });


  it('should warn if a controller name does not begin with an uppercase letter', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('sampleController', function() {});
    var ctrl = $controller('sampleController');
    expect(hintLog.logMessage).toHaveBeenCalledWith('##Controllers## The best practice is to name ' +
      'controllers with an uppercase first letter. Check the name of \'sampleController\'.');
  });


  it('should not warn if a controller name begins with an uppercase letter', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleController', function() {});
    var ctrl = $controller('SampleController');
    expect(hintLog.logMessage).not.toHaveBeenCalled();
  });


  it('should warn if a controller name does not include Controller', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('Sample', function() {});
    var ctrl = $controller('Sample');
    expect(hintLog.logMessage).toHaveBeenCalledWith('##Controllers## The best practice is to name ' +
      'controllers ending with \'Controller\'. Check the name of \'Sample\'');
  });


  it('should warn if a controller name does not end with Controller', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleControllerYay', function() {});
    var ctrl = $controller('SampleControllerYay');
    expect(hintLog.logMessage).toHaveBeenCalledWith('##Controllers## The best practice is to name ' +
      'controllers ending with \'Controller\'. Check the name of \'SampleControllerYay\'');
  });


  it('should not warn if a controller ends with Controller', function(){
    spyOn(hintLog, 'logMessage');
    angular.module('SampleApp', []).controller('SampleController', function() {});
    var ctrl = $controller('SampleController');
    expect(hintLog.logMessage).not.toHaveBeenCalled();
  });


  it('should collect all hinting messages using hintLog', function() {
    var controllerMock = function() {
      var element = document.createElement('a');
      element.innerHTML = 'testValue';
    };
    var sampleControl = $controller(controllerMock);
    angular.module('SampleApp', []).controller('sample', function() {});
    var ctrl = $controller('sample');
    expect(Object.keys(hintLog.flush()['Controllers']).length).toBe(3);
  });
});
