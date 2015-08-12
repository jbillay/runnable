var JourneyPage = (function () {
    'use strict';
    function JourneyPage() {
        this.journeyList = element.all(by.repeater('journey in journeyList'));
        this.journeyPublicMessages = element.all(by.repeater('message in publicMessages'));
        this.journeyHeader = element(by.id('journey-header'));
        this.journeyRunName = element(by.id('journey-run-name'));
        this.joinBtn = element(by.id('joinBtn'));
        this.joinedBtn = element(by.id('joinedBtn'));
        this.startFrom = element(by.id('startFrom'));
        this.journeyUser = element(by.id('journey_user'));
        this.journeyCarType = element(by.id('journey_car_type'));
        this.journeyPrice = element(by.id('journey_price'));
        this.journeyDistance = element(by.id('journey_distance'));
        this.journeyDuration = element(by.id('journey_duration'));
        this.journeyOutwardDate = element(by.id('outward_date'));
        this.journeyOutwardFreeSpace = element(by.id('outward_free_space'));
        this.journeyReturnDate = element(by.id('return_date'));
        this.journeyReturnFreeSpace = element(by.id('return_free_space'));
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