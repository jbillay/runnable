'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Runnable App', function() {
    describe('Public journey', function() {
        beforeEach(function() {
            browser.get('/');
            expect(browser.getTitle()).toEqual('My Run Trip');
        });

        it ('Should check that all link are present in the page', function () {
            // Check if form exist when user is not connected
            expect(element(by.css('#inscription .inscription-form')).isPresent()).toBe(true);
            element.all(by.css('.journey_list .journey_poster_home')).then(function(items) {
                expect(items.length).toBe(3);
                expect(items[0].element(by.css('.journey_map')).isPresent()).toBe(true);
                items[0].element(by.css('.journey_desc .journey_type')).getText().then(function(text) {
                    console.log(text);
                });
            });
        });
    });

    describe('Home page', function() {

        beforeEach(function() {
            browser.get('/');
            expect(browser.getTitle()).toEqual('My Run Trip');
        });

        it ('should login with jbillay@gmail.com', function () {
            element.all(by.css('.navbar-right li')).then(function(items) {
                expect(items.length).toBe(0);
                element(by.id('login')).click().then(function () {
                    expect(element(by.model('credentials.email')).isPresent()).toBe(true);
                    expect(element(by.model('credentials.password')).isPresent()).toBe(true);
                    expect(element(by.id('connection')).isPresent()).toBe(true);
                    element(by.model('credentials.email')).sendKeys('jbillay@gmail.com');
                    element(by.model('credentials.password')).sendKeys('noofs');
                    element(by.id('connection')).click().then(function () {
                        browser.getLocationAbsUrl().then(function(url) {
                            expect(url).toBe('/');
                            element.all(by.css('.navbar-right li')).then(function(items) {
                                expect(items.length).toBe(12);
                                // console.log(items[0].getText());
                                //expect(items[0].getText()).toBe('First');
                            }, 5000);
                        }, 5000);
                    }, 5000);
                }, 5000);
            });
        });
    });


    describe('Run page', function() {

        beforeEach(function() {
            browser.get('/run');
        });
    });
});
