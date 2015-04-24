'use strict';

module.exports = function(grunt) {
    // Unified Watch Object
    var watchFiles = {
        serverJS: ['Gruntfile.js', 'server.js', 'config/*.js', 'server/**/*.js'],
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
        /*
         Check why I should use ng-annotate
         ngAnnotate: {
         production: {
         options: {
         singleQuotes: true
         },
         files: [
         {
         expand: true,
         src: watchFiles.clientJS,
         ext: '.annotated.js'
         }
         ]
         }
         },
         */
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
                src: 'server/test', // a folder works nicely
                options: {
                    mask: '*.js'
                }
            }
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // Lint task(s).
    grunt.registerTask('lint', ['jshint', 'csslint']);

    // Test task.
    grunt.registerTask('test', ['env:test', 'mocha_istanbul:coverage']);

    // Test task.
    grunt.registerTask('test-travis', ['env:travis', 'mocha_istanbul:coverage']);

    // Test task.
    grunt.registerTask('travis', ['lint', 'test-travis']);

    // Test task.
    grunt.registerTask('package', ['concat:js', 'concat:css', 'uglify', 'cssmin']);

    // Build task(s).
    grunt.registerTask('build', ['lint', 'test', 'package']);
};