'use strict';
angular.module('testModule',['ngHintInterpolation','ngRoute'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      controller: 'iEyeController',
      templateUrl: 'iiLibDemo.html'
    }).
    otherwise({redirectTo: '/questions/intro'});
  }]);

angular.module('testModule')
  .controller('iEyeController', ['$scope', function($scope) {
    $scope.name = 'Carlos Guillen';
    $scope.data = {
      text: {
        fill: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel!',
        somethingElse: {a:'a'},
        ray: [1,2,3],
      },
      helloName: function(name){ return 'hello, '+name;},
      ray: [{a:'a',b:'b'},'banana','cashew'],
      imgSsc : 'hi',
      faker : 'LoL',
    };
  }]);