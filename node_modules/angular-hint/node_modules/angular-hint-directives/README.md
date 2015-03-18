Angular Hint Directives [![Build Status](https://travis-ci.org/angular/angular-hint-directives.svg?branch=master)](https://travis-ci.org/angular/angular-hint-directives) [![Code Climate](https://codeclimate.com/github/angular/angular-hint-directives.png)](https://codeclimate.com/github/angular/angular-hint-directives)
==================

Angular Hint Directives lets you spend less time finding silent errors in your code and more time actually programming. This tool is a subset of many under the [Angular Hint](https://github.com/angular/angular-hint) repository that specializes in identifying errors relating to directives. For instructions on how to incorporate the whole Angular Hint repository into your project, please refer to the link above.

#### Angular Hint Directive identifies:
  - [Misspelled HTML attributes and tags](#misspelled-directives-and-attributes)
  - [Misspelled directives and attributes (custom and core)](#misspelled-directives-and-attributes)
  - [Missing required attributes declared within the scope property](#missing-required-attributes)
  - [Using directives against their restrict property](#following-restrict-property)
  - [Using deprecated options such as 'replace'](#using-deprecated-options)
  - [Using HTML event attributes instead of Angular event directives (onclick vs. ngClick)](#using-angular-event-directives)
  - [Declaring directives with no namespace](#missing-namespace)


#### Misspelled Directives and Attributes
Angular Hint Directive identifies misspelled directives that would otherwise fail silently and notifies you of your mistake while also providing a suggestion for what you could mean. At first glance, the code below may seem to not have any errors, but the list elements would never get loaded on to the page. Hint Directive would alert you that you used *'ng-repaet'* and that you should try *'ng-repeat'*.
```html
<div>
  <ul>
    <li ng-repaet="i in [1,2,3,4]">{{i}}</li>
  </ul>
</div>
```
#### Missing Required Attributes
Angular Hint Directive identifies whether you include all variables declared through two way binding. In the example below, we have declared the attributes 'breadcrumbs' and 'id' to exsist within the 'haBreadcrumbs' directive.
```javascript
angular.module('breadcrumbs').
directive('haBreadcrumbs', function() {
  return {
    restrict: 'E',g
    templateUrl: 'components/breadcrumbs/breadcrumbs.html',
    scope: {
      breadcrumbs: '=',
      id = '@'
    }
  };
});
```
If you used your directive like in the HTML example below, you would be notified that you are missing the *'id'* attribute from your 'haBreadcrumbs' directive.
```html
<breadcrumbs ha-breadcrumbs="['home','profile','about']"> </breadcrumbs>
```

#### Following Restrict Property
Angular Hint Directives will also notify you if you use directives reserved for elements or attributes incorrectly. In the code below, we create a directive called 'haBreadcrumbs' that is restricted to elements only that will have an attribute by the name of 'breadcrumbs'.
```javascript
angular.module('breadcrumbs').
directive('haBreadcrumbs', function() {
  return {
    restrict: 'E',
    templateUrl: 'components/breadcrumbs/breadcrumbs.html',
    scope: {
      breadcrumbs: '='
    }
  };
});
```
So if in your code you tried to use the example below You would promtly be notified that you have used 'ha-breadcrumbs' as an *attribute* when its reserved for *elements only* and vice verse for 'breadcrumbs'.
```html
<breadcrumbs ha-breadcrumbs="['home','profile','about']"> </breadcrumbs>
```
#### Using Deprecated Options
Angular hint will notify you for using deprecated options when instantiating your directive. In the example below you will be warned for using the 'replace' option in your directive.
```javascript
angular.module('breadcrumbs').
directive('haBreadcrumbs', function() {
  return {
    restrict: 'E',
    templateUrl: 'components/breadcrumbs/breadcrumbs.html',
    scope: {breadcrumbs: '='},
    replace: true
  };
});
```
#### Using Angular Event Directives
Angular Hint Directives will notify you if you are using HTML event attributes such as onclick, onfocus, etc. and prompt you to use it's Angular counterpart. Below you would be told to change *'onchange'* to *'ng-change'*.
```html
<div id='search' onchange='update()'></div>
```

#### Missing Namespace
It is important for components we create to have their own unique namespace so as to not conflict with exsisting components in Angular or external libraries that may be used. As in below, if a directive with name 'mycomponent' was created, you would be warned and prompted to use a more appropriate name.
```javascript
angular.module('breadcrumbs').
  directive('mycomponent', function() { ... };
});
```

#### Sample of console after warnings:

![alt tag](https://raw.githubusercontent.com/angular/angular-hint-directives/master/demoApp/assets/img/Hint%20Directives%20Console.png)

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
