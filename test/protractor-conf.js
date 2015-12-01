exports.config = {
    allScriptsTimeout: 11000,

    seleniumAddress: 'http://localhost:4444/wd/hub',

    specs: [
        'e2e/*.js'
    ],

    /*
    multiCapabilities: [{
        'browserName': 'chrome'
    }, {
        'browserName': 'firefox'
    }],
     */

    capabilities: {
        'browserName': 'chrome'
    },

    chromeOnly: true,

    baseUrl: 'http://localhost:4000/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    },

    onPrepare: 'e2e/scripts/onPrepare.js'
};