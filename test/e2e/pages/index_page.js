var IndexPage = (function () {
    'use strict';
    function IndexPage() {
        this.emailField = element(by.model('credentials.email'));
        this.passwordField = element(by.model('credentials.password'));
        this.loginButton = element(by.id('connection'));
        this.inscriptionForm = element(by.css('#inscription .inscription-form'));
        this.journeyList = element.all(by.repeater('journey in listJourney'));
        this.runList = element.all(by.repeater('run in listRun'));
    }

    IndexPage.prototype.visitPage = function () {
        browser.get('/');
    };

    IndexPage.prototype.getTitle = function () {
        return browser.getTitle();
    };

    IndexPage.prototype.fillEmail = function (email) {
        this.emailField.clear();
        this.emailField.sendKeys(email);
    };

    IndexPage.prototype.fillPassword = function (password) {
        this.passwordField.clear();
        this.passwordField.sendKeys(password);
    };

    IndexPage.prototype.login = function () {
        this.loginButton.click();
    };

    return IndexPage;
})();

module.exports = IndexPage;