var IndexPage = (function () {
    'use strict';
    function IndexPage() {
        this.emailField = element(by.model('credentials.email'));
        this.passwordField = element(by.model('credentials.password'));
        this.connectionButton = element(by.id('connection'));
        this.loginButton = element(by.id('login'));
        this.inscriptionForm = element(by.css('#inscription .inscription-form'));
        this.journeyList = element.all(by.repeater('journey in listJourney'));
        this.journeyBtn = element(by.css('.itineraire .btn'));
        this.runList = element.all(by.repeater('run in listRun'));
        this.runBtn = element(by.css('.course .btn'));
    }

    IndexPage.prototype.visitPage = function () {
        browser.get('/');
    };

    IndexPage.prototype.getTitle = function () {
        return browser.getTitle();
    };

    IndexPage.prototype.fillEmail = function (email) {
        browser.waitForAngular();
        browser.executeScript('var scope = angular.element($(".credentials_email").get(0)).scope(); scope.credentials.email = "jbillay@gmail.com"; scope.$apply();');
    };

    IndexPage.prototype.fillPassword = function (password) {
        browser.waitForAngular();
        browser.executeScript('var scope = angular.element($(".credentials_password").get(0)).scope(); scope.credentials.password = "noofs"; scope.$apply();');
    };

    IndexPage.prototype.openLoginForm = function () {
        this.loginButton.click();
    };

    IndexPage.prototype.login = function () {
        this.connectionButton.click();
    };

    return IndexPage;
})();

module.exports = IndexPage;