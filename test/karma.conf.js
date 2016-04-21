module.exports = function(config) {
    'use strict';
    config.set({

        basePath : '../',

        logLevel: config.LOG_INFO,

        files : [
            'public/lib/jquery/dist/jquery.min.js',
            'public/lib/angular/angular.js',
            'public/lib/angular-route/angular-route.js',
            'public/lib/angular-resource/angular-resource.js',
            'public/lib/angular-mocks/angular-mocks.js',
            'public/lib/angular-sanitize/angular-sanitize.js',
            'public/lib/angular-ui-calendar/src/calendar.js',
            'public/lib/angular-messages/angular-messages.min.js',
            'public/lib/ng-file-upload/ng-file-upload.min.js',
            'public/lib/bootstrap/dist/js/bootstrap.min.js',
            'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'public/lib/ng-facebook/ngFacebook.js',
            'public/lib/moment/min/moment.min.js',
            'public/lib/fullcalendar/dist/fullcalendar.min.js',
            'public/lib/angular-ui-calendar/src/calendar.js',
            'public/lib/fullcalendar/dist/gcal.js',
            'public/lib/clockpicker/dist/bootstrap-clockpicker.min.js',
            'public/lib/noty/js/noty/packaged/jquery.noty.packaged.min.js',
            'public/lib/lodash/dist/lodash.min.js',
            'public/js/*.js',
            'test/unit/*.js'
        ],

        port : 9877,

        singleRun: true,

        exclude : [
            'public/js/index.js'
        ],

        frameworks: ['jasmine'],

        browsers : ['PhantomJS', 'Chrome', 'Firefox'],

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],

        // coverage reporter generates the coverage
        reporters: ['progress', 'coverage'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'public/js/*.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
            dir : 'coverage/',
            reporters: [
                { type: 'html', subdir: 'karma-report' }
            ]
        }
    });
};