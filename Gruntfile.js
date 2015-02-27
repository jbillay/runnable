'use strict';

module.exports = function(grunt) {
    // Unified Watch Object
    var watchFiles = {
        serverJS: ['gruntfile.js', 'server.js', 'config/*.js', 'server/**/*.js'],
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
        uglify: {
            production: {
                options: {
                    mangle: false
                },
                files: {
                    'public/dist/application.min.js': 'public/dist/application.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/dist/application.min.css': '<%= applicationCSSFiles %>'
                }
            }
        },
        ngAnnotate: {
            production: {
                files: {
                    'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
                }
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'server/test', // a folder works nicely
                options: {
                    mask: '*.js'
                }
            }
        },
        istanbul_check_coverage: {
            default: {
                options: {
                    coverageFolder: 'coverage*', // will check both coverage folders and merge the coverage results
                    check: {
                        lines: 80,
                        statements: 80
                    }
                }
            }
        }
    });

    grunt.event.on('coverage', function(lcovFileContents, done){
        // Check below
        done();
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    // Lint task(s).
    grunt.registerTask('lint', ['jshint', 'csslint']);

    // Build task(s).
    grunt.registerTask('build', ['lint', 'test', 'ngAnnotate', 'uglify', 'cssmin']);

    // Test task.
    grunt.registerTask('test', ['env:test', 'mocha_istanbul:coverage']);
};