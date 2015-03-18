Angular Hint Events [![Build Status](https://travis-ci.org/angular/angular-hint-events.svg?branch=master)](https://travis-ci.org/angular/angular-hint-events) [![Code Climate](https://codeclimate.com/github/angular/angular-hint-events.png)](https://codeclimate.com/github/angular/angular-hint-events)
==================

Angular Hint Events lets you spend less time finding silent errors in your code and more time programming. This tool is a subset of many under the [Angular Hint](https://github.com/angular/angular-hint) repository that specializes in identifying errors relating to directives. For instructions on how to incorporate the whole Angular Hint repository into your project, please refer to the link above.

#### [Identifying Undefined Variables](identifying-undefined-variables)
Angular Hint Events checks all ngEventDirectives `ngClick`, `ngMousedown`, `ngFocus`, etc. and their attributes for defined functions and variables on the appropriate `$scope`. If a function or variable is found to be `undefined`, Hint Events will notify you and suggest the closest match if one exsists. In the first example below, one would be warned that the function `increments` doesn't exist for its scope and that you should try `increment`.

More complicated expressions will still be checked for values found to be `undefined`. The second example would cause a warning saying that `divideVal` and `divide` are not defined.

##### Example HTML Implementation
```html
<a ng-click="increments">Count!</a>
<a ng-click="divideVal = dividend() / divide()">Count!</a>
```

##### Example Controller Implementation:
```javascript
angular.module('demoApp').controller('DemoController', ['$scope', function($scope) {
  $scope.count = 0;
  $scope.divideValue;
  $scope.increment = function() {
    ++$scope.count
  };
  $scope.dividend = function() {
    return Math.random()*20+20
  };
  $scope.divisor = function() {
    return Math.random()*10+1
  };
}]);
```

## [License](LICENSE)

Copyright 2014 Google, Inc. http://angularjs.org

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
