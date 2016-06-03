'use strict';

module.exports = function(grunt) {
    // Unified Watch Object
    var watchFiles = {
        serverJS: ['Gruntfile.js', 'server.js', 'config/*.js', 'server/**/*.js', 'test/**/*.js'],
        clientViews: ['public/views/**/*.html'],
        clientJS: ['public/js/*.js'],
        clientCSS: ['public/css/*.css'],
        clientLESS: ['public/less/*.less']
    };

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: {
                src: watchFiles.clientJS.concat(watchFiles.serverJS, watchFiles.clientJS),
                options: {
                    jshintrc: true
                }
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            all: {
                src: watchFiles.clientCSS
            }
        },
        less: {
            compile: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    'public/css/main.css': 'public/less/main.less',
                    'public/css/desktop.css': 'public/less/desktop.less',
                    'public/css/large.css': 'public/less/large.less',
                    'public/css/phone.css': 'public/less/phone.less',
                    'public/css/tablet.css': 'public/less/tablet.less'
                }
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            },
            travis: {
                NODE_ENV: 'travis'
            }
        },
        protractor_webdriver: {
            alive: {
                options: {
                    path: '/usr/local/bin/',
                    keepAlive: true
                }
            }
        },
        protractor: {
            options: {
                configFile: 'test/protractor-conf.js', // Default config file
                keepAlive: false, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                args: {
                    // Arguments passed to the command
                }
            },
            all: {}
        },
        mocha_istanbul: {
            coverage: {
                src: 'test/api', // a folder works nicely
                options: {
                    mask: '*.js'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            },
            travis: {
                configFile: 'test/karma.travis.conf.js'
            }
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // Lint task(s).
    grunt.registerTask('lint', ['less:compile', 'jshint', 'csslint']);

    // Node Test task.
    grunt.registerTask('node-unit-test', ['env:test', 'mocha_istanbul:coverage']);

    // Angular Test task.
    grunt.registerTask('angular-unit-test', ['env:test', 'karma:unit']);

    // Angular Test task.
    grunt.registerTask('aut', ['env:test', 'karma:travis']);

    // e2e Test task.
    grunt.registerTask('e2e', ['env:test', 'protractor_webdriver', 'protractor']);

    // Test task(s).
    grunt.registerTask('test', ['lint', 'node-unit-test', 'angular-unit-test']);

    // Test task.
    grunt.registerTask('test-travis', ['env:travis', 'mocha_istanbul:coverage', 'karma:travis']);

    // Test task.
    grunt.registerTask('travis', ['lint', 'test-travis']);
};