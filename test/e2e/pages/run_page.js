var RunPage = (function () {
    'use strict';
    function RunPage() {
        this.runList = element.all(by.repeater('run in listRun'));
    }

    RunPage.prototype.visitPage = function (runId) {
        if (runId) {
            browser.get('/run-' + runId);
        } else {
            browser.get('/run');
        }
    };

    RunPage.prototype.getTitle = function () {
        return browser.getTitle();
    };

    RunPage.prototype.fillSimpleSearch = function (value) {
        browser.waitForAngular();
        browser.executeScript('var scope = angular.element($(".credentials_email").get(0)).scope(); scope.credentials.email = "' + value  + '"; scope.$apply();');
    };

    return RunPage;
})();

module.exports = RunPage;