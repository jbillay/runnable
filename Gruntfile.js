'use strict';

module.exports = function(grunt) {
    // Unified Watch Object
    var watchFiles = {
        serverJS: ['Gruntfile.js', 'server.js', 'config/*.js', 'server/**/*.js', 'test/**/*.js'],
        clientViews: ['public/views/**/*.html'],
        clientJS: ['public/js/*.js'],
        clientCSS: ['public/css/*.css']
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
        concat: {
            js: {
                src: [watchFiles.clientJS],
                dest: 'dist/pubic/js/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            css: {
                src: [watchFiles.clientCSS],
                dest: 'dist/pubic/css/<%= pkg.name %>-<%= pkg.version %>.css'
            }
        },
        uglify: {
            production: {
                options: {
                    mangle: false
                },
                files: {
                    'dist/pubic/js/<%= pkg.name %>-<%= pkg.version %>.min.js': 'dist/pubic/js/<%= pkg.name %>-<%= pkg.version %>.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'dist/pubic/css/<%= pkg.name %>-<%= pkg.version %>.min.css': 'dist/pubic/css/<%= pkg.name %>-<%= pkg.version %>.css'
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
            }
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // Lint task(s).
    grunt.registerTask('lint', ['jshint', 'csslint']);

    // Node Test task.
    grunt.registerTask('node-unit-test', ['env:test', 'mocha_istanbul:coverage']);

    // Angular Test task.
    grunt.registerTask('angular-unit-test', ['env:test', 'karma']);

    // Test task(s).
    grunt.registerTask('test', ['lint', 'node-unit-test', 'angular-unit-test']);

    // Test task.
    grunt.registerTask('test-travis', ['env:travis', 'mocha_istanbul:coverage']);

    // Test task.
    grunt.registerTask('travis', ['lint', 'test-travis']);

    // Test task.
    grunt.registerTask('package', ['concat:js', 'concat:css', 'uglify', 'cssmin']);
};