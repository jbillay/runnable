# Angular Hint Log [![Build Status](https://travis-ci.org/angular/angular-hint-log.svg?branch=master)](https://travis-ci.org/angular/angular-hint-log) [![Code Climate](https://codeclimate.com/github/angular/angular-hint-log/badges/gpa.svg)](https://codeclimate.com/github/angular/angular-hint-log)

A library to format messages for [AngularHint](https://github.com/angular/angular-hint).

See the [NPM Module](https://www.npmjs.org/package/angular-hint-log).

## Usage

###1. Overview

  AngularHint provides runtime hinting for AngularJS. This hinting relies on various
AngularHint modules that cover different areas of AngularJS such as controllers and modules. To
collect and format the messages from these various modules, AngularHintLog provides a message
queue. Inside this message queue, messages are categorized according to their source module. This
allows AngularHint to provide grouped messages.

###2. API

####[logMessage](https://github.com/angular/angular-hint-log/blob/master/hint-log.js#L14)
----------------
#####Use as: logMessage(message)

Log a message to the AngularHintLog queue.

####Example

```javascript
var hintLog = require('angular-hint-log');

hintLog.logMessage('##Controllers## The best practice is to name controllers with "Controller"');
```

####Params
Param | Type | Description
---   | ---  | ---
message | String | A message that includes the module name delimited by `##` in the form of `'##ModuleName## Message to log'`


####[flush](https://github.com/angular/angular-hint-log/blob/master/hint-log.js#L37)
----------------
#####Use as: flush()

Return - and empty - the current AngularHintLog queue.

####Example

```javascript
var hintLog = require('angular-hint-log');

hintLog.logMessage('##Controllers## The best practice is to name controllers with "Controller"');
//Assigns the queue to 'log'
var log = hintLog.flush();
//Assigns 'The best practice is to name controllers with "Controller"' to 'message1'
var message1 = Object.keys(log['Controllers']);
//Assigns an empty object as the queue is now empty
var empty = hintLog.flush();
```

####Returns

Type | Description
---  | ---
Object| An Object with keys representing names of modules identified by `##` syntax. Each module name is keyed to an object representing that module's messages. Messages not logged with the `##` name syntax are keyed to `General`.


####[onMessage](https://github.com/angular/angular-hint-log/blob/master/hint-log.js#L43)
----------------
#####Use as: onMessage = function(message) {};

Set a behavior to be done when each message is logged. This is an optional step to allow custom
behavior when messages are logged. It does not affect the behavior of `logMessage` or `flush`.

####Example

```javascript
var hintLog = require('angular-hint-log');

hintLog.onMessage = function(message) {
  throw new Error(message);
}

//Throws the error '##Controllers## The best practice is to name controllers with "Controller"'
hintLog.logMessage('##Controllers## The best practice is to name controllers with "Controller"');
```

##Building Angular Hint Log

The following instructions describe how to include the AngularHintLog dependency in the
working directory of an AngularHint module.

1. Working in the module's main directory, install the necessary npm packages:

  ```
  npm install angular-hint-log browserify gulp vinyl-source-stream --save
  ```

2. Create a `gulpfile.js` file to give instructions to gulp to build the module:

  ```
  //gulpfile.js

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

3. Add the AngularHintLog dependency to the module's files using `require`:

  ```javascript
  var hintLog = angular.hint = require('angular-hint-log');
  ```
  In the build step, browserify interprets the `require` command to load the functionality of
  AngularHintLog into the hintLog variable. Creating `angular.hint` allows use of `var hintLog = angular.hint`
  in unit testing.

4. Since the module is now built by gulp using browserify, it must be built before
use and testing. For unit testing with karma, install the following package with npm:

  ```
  npm install karma-bro --save
  ```

  And update the `karma.conf.js` to pre-process the files:

  ```
    //karma.conf.js
    frameworks: ['browserify', 'jasmine'],
    preprocessors: {
        'your-module-file.js': ['browserify']
    }
  ```
  Alternatively, use the `gulp` command to build the files. Built files will be located
  in the `\dist` directory.

5. AngularHintLog is ready to log messages!

  ```
  hintLog.logMessage('##Module Name## Error message');
  ```

  This call adds a message to the AngularHintLog queue. The `##Module Name##` prefix is optional but
  will allow AngularHint to group the message with other messages from the same module.

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
