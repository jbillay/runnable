var JourneyPage = (function () {
    'use strict';
    function JourneyPage() {
        this.journeyList = element.all(by.repeater('journey in journeyList'));
        this.journeyHeader = element(by.id('journey-header'));
    }

    JourneyPage.prototype.visitPage = function (journeyId) {
        if (journeyId) {
            browser.get('/journey-' + journeyId);
        } else {
            browser.get('/journey');
        }
    };

    JourneyPage.prototype.getTitle = function () {
        return browser.getTitle();
    };

    JourneyPage.prototype.fillSearch = function (value) {
        browser.waitForAngular();
        browser.executeScript('var scope = angular.element($(".credentials_email").get(0)).scope(); scope.credentials.email = "' + value  + '"; scope.$apply();');
    };

    return JourneyPage;
})();

module.exports = JourneyPage;