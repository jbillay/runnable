Angular Hint: Interpolation [![Build Status](https://travis-ci.org/angular/angular-hint-interpolation.svg)](https://travis-ci.org/angular/angular-hint-interpolation)[![Code Climate](https://codeclimate.com/github/angular/angular-hint-interpolation.png)](https://codeclimate.com/github/angular/angular-hint-interpolation)
=========

Angular Hint Interpolation lets you spend less time finding silent errors in your code and more time programming. This tool is a subset of many under the [Angular Hint](https://github.com/angular/angular-hint) repository that specializes in identifying errors relating to directives. For instructions on how to incorporate the whole Angular Hint repository into your project, please refer to the link above.

#### Angular Hint Interpolation:
  - [Notifies of undefined parts of interpolation chains](#undefined-parts-warning)
  - [Suggests closest variable to the first undefined variable in chain](#variable-suggestion)


#### Undefined Parts Warning
 Hint Interpolation addresses the problem of identifying where (withinin a chain) objects become undefined. For example, in the HTML code below (given the controller implementation further below) one would be notified that `data.results[0].urls` was found to be `undefined` in the interpolation `data.results[0].entities.urls.main_url`.

```html
<a ng-href="{{data.results[0].urls.main_url}}">Link to Post</a>
```
#### Variable Suggestion
 If your value that evaluates to `undefined` is close enough to the actual value, Hint Interpolation will suggest an alternative value. Using the HTML code below, you would be notified that `data.results[0].entity` was undefined but that you should try `entities`.
```html
<a ng-href="{{data.results[0].entity.urls.main_url}}">Link to Post</a>
```

##### Example Controller Implementation:
```javascript
// in a controller...
$scope.data = {
  "completed_in": 0.031,
  "refresh_url": "?sinceid=122078461840982016&q=blue%20angels",
  "results": [
    {
      "entities":{
        "urls": {
          "condensed_url": "http://t.co/L9JXJ2ee",
          "main_url": "http://t.co/imgs/users/venrov/L9JXJ2ee"
        }
      }
    }]
}
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
