module.exports = function(config) {
    'use strict';
    config.set({

        basePath : '../',

        files : [
            'public/lib/jquery/dist/jquery.min.js',
            'public/lib/angular/angular.js',
            'public/lib/angular-route/angular-route.js',
            'public/lib/angular-resource/angular-resource.js',
            'public/lib/angular-mocks/angular-mocks.js',
            'public/lib/angular-sanitize/angular-sanitize.js',
            'public/lib/angular-ui-calendar/src/calendar.js',
            'public/lib/angular-messages/angular-messages.min.js',
            'public/lib/bootstrap/dist/js/bootstrap.min.js',
            'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'public/lib/moment/min/moment.min.js',
            'public/lib/fullcalendar/fullcalendar.js',
            'public/lib/angular-ui-calendar/src/calendar.js',
            'public/lib/fullcalendar/gcal.js',
            'public/lib/clockpicker/dist/bootstrap-clockpicker.min.js',
            'public/js/*.js',
            'public/lib/noty/js/noty/packaged/jquery.noty.packaged.min.js',
            'test/unit/*.js'
        ],

        exclude : [
            'public/js/index.js'
        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'coverage/unit.xml',
            suite: 'unit'
        }

    });
};