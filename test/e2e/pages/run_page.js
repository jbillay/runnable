var RunPage = (function () {
    'use strict';
    function RunPage() {
        this.runList = element.all(by.repeater('run in listRun'));
        this.runName = element(by.id('run_name'));
        this.runActionButtons = element.all(by.css('.btn-group .btn'));
        this.runCreateJourneyButton = element(by.css('.btn-group .btn:first-child'));
        this.runAddAgendaButton = element(by.css('.btn-group .btn:last-child'));
        this.runAddressStart = element(by.id('run_address_start'));
        this.runDateStart = element(by.id('run_date_start'));
        this.runTimeStart = element(by.id('run_time_start'));
        this.runType = element(by.id('run_type'));
        this.runDistances = element(by.id('run_distances'));
        this.runElevations = element(by.id('run_elevations'));
        this.runNoJourney = element(by.id('no_journey'));
        this.runJourneyList = element.all(by.repeater('journey in journeyList'));
        this.runMap = element(by.id('map_canvas_run'));
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