angular.module('demoApp',['ngRoute','ngHintEvents'])
  .config(['$routeProvider',function($routeProvider){
    $routeProvider.when('/', {
      controller: 'DemoController',
      controllerAs: 'demoCtrl',
      templateUrl: 'template.html'
    }).
    otherwise({redirectTo: '/'});
  }]);

angular.module('demoApp').controller('DemoController', ['$scope', function($scope) {
  $scope.name = 'Angular Hint: Events';
  $scope.count = 0;
  $scope.divideValue = 0;
  $scope.increment = function(){++$scope.count};
  $scope.dividend = function(){return Math.random()*20+20};
  $scope.divisor = function(){return Math.random()*10+1};
}]);