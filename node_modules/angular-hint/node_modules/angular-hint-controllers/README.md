#Angular Hint Controllers [![Build Status](https://travis-ci.org/angular/angular-hint-controllers.svg?branch=master)](https://travis-ci.org/angular/angular-hint-controllers) [![Code Climate](https://codeclimate.com/github/angular/angular-hint-controllers/badges/gpa.svg)](https://codeclimate.com/github/angular/angular-hint-controllers)

This hinting module is part of the overall tool [AngularHint](https://github.com/angular/angular-hint)
that provides advice about AngularJS best practices. Loading this module will provide warnings specific
to AngularJS controllers.

See the [AngularHintControllers NPM Module](https://www.npmjs.org/package/angular-hint-controllers).

##Usage

Install the [AngularHint NPM module](https://www.npmjs.org/package/angular-hint)
and use `ng-hint` or `ng-hint-include='controllers'` to
enable AngularHintControllers. Further installation information is available on the
[main AngularHint repository](https://github.com/angular/angular-hint#usage).

##Features

1. Warns About Use of Global Controllers
  **Global Controllers are Deprecated in Angular 1.3.0**

  Angular controllers should not be globally registered. They should be
  registered on modules. For instance:

  ```javascript
  angular.module('controllerApp').controller(function(){
    //Do some behavior
  });
  ```

2. Hints About Best Practices for Controller Naming

  Angular controller names should begin with a capital letter and end with -Controller.

  ```javascript
  angular.module('SampleApp', []).controller('SampleController', function() {});
  ```

##Contributing

We'd love to get your help! See the [Contributing Guidelines](https://github.com/angular/angular-hint/blob/master/CONTRIBUTING.md) for AngularHint.