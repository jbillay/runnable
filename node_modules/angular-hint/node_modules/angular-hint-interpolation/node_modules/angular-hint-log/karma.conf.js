module.exports = function(config) {
  config.set({
    frameworks: ['browserify','jasmine'],
    files: [
      '*_test.js'
    ],
    exclude: [],
    preprocessors: {
      'hint-log_test.js': ['browserify']
    },
    browsers: ['Chrome'],
    reporters: ['dots'],
    singleRun: false,
    browserify: {
      debug: true
    }
  });
};