Angular Hint Log [![Build Status](https://travis-ci.org/angular/angular-hint-log.svg?branch=master)](https://travis-ci.org/angular/angular-hint-log)
==================

A library to format messages for the AngularHint tool

# How to Install AngularHintLog into your own AngularHint module

Working in your module's directory on the commandline, copy the following code:

```javascript
npm install angular/angular-hint-log browserify gulp vinyl-source-stream
```

This uses npm to install the `angular-hint-log` directory from GitHub as well as two dependencies
for building the library.

Next create a gulpfile to give instructions to gulp to build your module:
```javascript
touch gulpfile.js
```

Open the gulpfile.js and enter the following:
```javascript

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var main = require('./package.json').main;

gulp.task('watch', function(){
  gulp.watch(['./**/*.js', '!./dist/*.js'], ['browserify']);
});

gulp.task('browserify', function() {
  var bundleStream = browserify('./' + main).bundle().pipe(source(main));
  return bundleStream.pipe(gulp.dest('./dist'));
});

gulp.task('default', ['browserify']);

```

Now that the dependencies are in place, you can add the functionality of hintLog to
your module by calling:

```javascript
var hintLog = require('angular-hint-log');

Since your module is now built by gulp using browserify, make sure to build your file for
use and testing. When testing with karma, install the following with npm:

```javascript
npm install karma-bro
```

And add the following to the appropriate places in your `karma.conf.js`:

```javascript
  frameworks: ['browserify', 'jasmine'],
  preprocessors: {
      'your-module-file.js': ['browserify']
  }
```
At this point you are set up to use the HintLog logging method!

Simply call `hintLog.logMessage('##Your Module Name## Your error message')` to add a message to the
queue of HintLog messages. The `##Your Module Name##` prefix is optional, but will allow AngularHint
to group your message with other messages from your module.

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
