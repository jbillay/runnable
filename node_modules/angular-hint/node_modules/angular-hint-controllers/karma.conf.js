module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'hint-controllers.js',
      'hint-controllers_test.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'hint-controllers.js': ['browserify']
    },
    browsers: ['Chrome'],
    browserify: {
      debug: true
    }
  });
};
