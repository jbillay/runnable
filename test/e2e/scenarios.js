'use strict';

require('jasmine-given');

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

var IndexPage = require('./pages/index_page');

describe('Runnable app', function() {
    var page = new IndexPage();
    describe('visiting the home page', function () {
        Given(function() {
            page.visitPage();
        });
        Then(function() {
            page.getTitle().then(function(text) {
                expect(text).toEqual('My Run Trip');
            });
            expect(page.inscriptionForm.isPresent()).toBe(true);
            page.journeyList.then(function (items) {
                expect(items.length).toBe(3);
                items.forEach(function (item) {
                    expect(item.element(by.css('.journey_map')).isPresent()).toBe(true);
                });
            });
            var data_journey = [
                {
                    id: 4,
                    'journey.Run.name': 'Maxi-Race ®',
                    'journey.address_start': 'Saint-Germain-En-Laye',
                    'journey.journey_type': 'Aller-Retour',
                    'journey.date_start_outward': '12 / 05 / 2016',
                    'journey.duration': '5 heures 16 minutes',
                    'journey.distance': '576 km'
                },
                {
                    id: 2,
                    'journey.Run.name': 'Les Templiers',
                    'journey.address_start': 'Nantes, France',
                    'journey.journey_type': 'Aller',
                    'journey.date_start_outward': '02 / 06 / 2016',
                    'journey.duration': '6 heures 36 minutes',
                    'journey.distance': '754 km'
                },
                {
                    id: 3,
                    'journey.Run.name': 'Paris Saint Germain',
                    'journey.address_start': 'Paris, France',
                    'journey.journey_type': 'Retour',
                    'journey.date_start_return': '02 / 08 / 2016',
                    'journey.duration': '5 heures 38 minutes',
                    'journey.distance': '652 km'
                }
            ];
            data_journey.forEach(function (item, index) {
                var arr = Object.keys(item);
                expect(element(by.repeater('journey in listJourney').row(index)).
                    element(by.css('.journey_poster_home .journey_title a')).getAttribute('href')).
                    toEqual('http://localhost:9615/journey-' + item['id']);
                arr.forEach(function (line) {
                    if (line !== 'id') {
                        var value = element(by.repeater('journey in listJourney').row(index).column(line));
                        value.getText().then(function (text) { expect(text).toEqual(item[line]);});
                    }
                });
            });
            expect(element(by.css('.itineraire .btn')).isPresent()).toBe(true);
            expect(element(by.css('.itineraire .btn')).getAttribute('href')).toEqual('http://localhost:9615/journey');
            page.runList.then(function (items) {
                expect(items.length).toBe(4);
                items.forEach(function (item) {
                    expect(item.element(by.css('.run_img')).isPresent()).toBe(true);
                });
            });
            var data_run = [
                {
                    id: 19,
                    'run.name': 'Maxi-Race ®',
                    'run.address_start': 'Saint-Germain-En-Laye',
                    'run.date_start': 'Aller-Retour',
                    'run.distances': '12 / 05 / 2016',
                    'run.type': '5 heures 16 minutes'
                },
                {
                    id: 2,
                    'run.name': 'Maxi-Race ®',
                    'run.address_start': 'Saint-Germain-En-Laye',
                    'run.date_start': 'Aller-Retour',
                    'run.distances': '12 / 05 / 2016',
                    'run.type': '5 heures 16 minutes'
                },
                {
                    id: 3,
                    'run.name': 'Maxi-Race ®',
                    'run.address_start': 'Saint-Germain-En-Laye',
                    'run.date_start': 'Aller-Retour',
                    'run.distances': '12 / 05 / 2016',
                    'run.type': '5 heures 16 minutes'
                },
                {
                    id: 16,
                    'run.name': 'Maxi-Race ®',
                    'run.address_start': 'Saint-Germain-En-Laye',
                    'run.date_start': 'Aller-Retour',
                    'run.distances': '12 / 05 / 2016',
                    'run.type': '5 heures 16 minutes'
                }
            ];
            data_run.forEach(function (item, index) {
                var arr = Object.keys(item);
                expect(element(by.repeater('run in listRun').row(index)).
                    element(by.css('.run_title a')).getAttribute('href')).
                    toEqual('http://localhost:9615/run-' + item['id']);
                arr.forEach(function (line) {
                    if (line !== 'id') {
                        var value = element(by.repeater('run in listRun').row(index).column(line));
                        value.getText().then(function (text) { expect(text).toEqual(item[line]);});
                    }
                });
            });
            expect(element(by.css('.course .btn')).isPresent()).toBe(true);
            expect(element(by.css('.course .btn')).getAttribute('href')).toEqual('http://localhost:9615/run');
        });
    });
});

/*
describe('Runnable App', function() {
    describe('Public journey', function() {
        beforeEach(function() {
            browser.get('/');
            expect(browser.getTitle()).toEqual('My Run Trip');
        });

        it ('Should find inscription form', function () {
            // Check if form exist when user is not connected
            expect(element(by.css('#inscription .inscription-form')).isPresent()).toBe(true);
        });

        it ('Should find 3 journey posters with data and link', function () {
            element.all(by.css('.journey_list .journey_poster_home')).then(function(items) {
                expect(items.length).toBe(3);
                expect(items[0].element(by.css('.journey_map')).isPresent()).toBe(true);
                items[0].element(by.css('.journey_poster_home .journey_title')).getText().then(function(text) {
                    expect(text).toBe('Maxi-Race ®'); });
                expect(items[0].element(by.css('.journey_poster_home .journey_title a')).getAttribute('href')).toEqual('http://localhost:9615/journey-4');
                items[0].element(by.css('.journey_desc .journey_address')).getText().then(function(text) {
                    expect(text).toBe('Saint-Germain-En-Laye'); });
                items[0].element(by.css('.journey_desc .journey_type')).getText().then(function(text) {
                    expect(text).toBe('Aller-Retour'); });
                items[0].element(by.css('.journey_desc .journey_date')).getText().then(function(text) {
                    expect(text).toBe('12 / 05 / 2016'); });
                items[0].element(by.css('.journey_desc .journey_duration')).getText().then(function(text) {
                    expect(text).toBe('5 heures 16 minutes'); });
                items[0].element(by.css('.journey_desc .journey_distance')).getText().then(function(text) {
                    expect(text).toBe('576 km'); });
                items[1].element(by.css('.journey_poster_home .journey_title')).getText().then(function(text) {
                    expect(text).toBe('Les Templiers'); });
                expect(items[1].element(by.css('.journey_poster_home .journey_title a')).getAttribute('href')).toEqual('http://localhost:9615/journey-2');
                items[1].element(by.css('.journey_desc .journey_address')).getText().then(function(text) {
                    expect(text).toBe('Nantes, France'); });
                items[1].element(by.css('.journey_desc .journey_type')).getText().then(function(text) {
                    expect(text).toBe('Aller'); });
                items[1].element(by.css('.journey_desc .journey_date')).getText().then(function(text) {
                    expect(text).toBe('02 / 06 / 2016'); });
                items[1].element(by.css('.journey_desc .journey_duration')).getText().then(function(text) {
                    expect(text).toBe('6 heures 36 minutes'); });
                items[1].element(by.css('.journey_desc .journey_distance')).getText().then(function(text) {
                    expect(text).toBe('754 km'); });
                items[2].element(by.css('.journey_poster_home .journey_title')).getText().then(function(text) {
                    expect(text).toBe('Paris Saint Germain'); });
                expect(items[2].element(by.css('.journey_poster_home .journey_title a')).getAttribute('href')).toEqual('http://localhost:9615/journey-3');
                items[2].element(by.css('.journey_desc .journey_address')).getText().then(function(text) {
                    expect(text).toBe('Paris, France'); });
                items[2].element(by.css('.journey_desc .journey_type')).getText().then(function(text) {
                    expect(text).toBe('Retour'); });
                items[2].element(by.css('.journey_desc .journey_date')).getText().then(function(text) {
                    expect(text).toBe('02 / 08 / 2016'); });
                items[2].element(by.css('.journey_desc .journey_duration')).getText().then(function(text) {
                    expect(text).toBe('5 heures 38 minutes'); });
                items[2].element(by.css('.journey_desc .journey_distance')).getText().then(function(text) {
                    expect(text).toBe('652 km'); });
            });
            expect(element(by.css('.itineraire .btn')).isPresent()).toBe(true);
            expect(element(by.css('.itineraire .btn')).getAttribute('href')).toEqual('http://localhost:9615/journey');
        });

        it ('Should find 4 run posters with data and link', function () {
            element.all(by.css('.run_list .run_poster_home')).then(function(items) {
                expect(items.length).toBe(4);
                expect(items[0].element(by.css('.run_img')).isPresent()).toBe(true);

                items[0].element(by.css('.run_title')).getText().then(function(text) {
                    expect(text).toBe('Ice Trail Tarentaise'); });
                expect(items[0].element(by.css('.run_title a')).getAttribute('href')).toEqual('http://localhost:9615/run-19');
                items[0].element(by.css('.run_desc .run_address')).getText().then(function(text) {
                    expect(text).toBe('Saint-Germain-En-Laye'); });
                items[0].element(by.css('.run_desc .run_date')).getText().then(function(text) {
                    expect(text).toBe('12 / 05 / 2016'); });
                items[0].element(by.css('.run_desc .run_distance')).getText().then(function(text) {
                    expect(text).toBe('576 km'); });
                items[0].element(by.css('.run_desc .run_type')).getText().then(function(text) {
                    expect(text).toBe('Aller-Retour'); });

                items[1].element(by.css('.run_title')).getText().then(function(text) {
                    expect(text).toBe('Les Templiers'); });
                expect(items[1].element(by.css('.run_title a')).getAttribute('href')).toEqual('http://localhost:9615/run-2');
                items[1].element(by.css('.run_desc .run_address')).getText().then(function(text) {
                    expect(text).toBe('Nantes, France'); });
                items[1].element(by.css('.run_desc .run_date')).getText().then(function(text) {
                    expect(text).toBe('02 / 06 / 2016'); });
                items[1].element(by.css('.run_desc .run_distance')).getText().then(function(text) {
                    expect(text).toBe('754 km'); });
                items[1].element(by.css('.run_desc .run_type')).getText().then(function(text) {
                    expect(text).toBe('Aller'); });

                items[2].element(by.css('.run_title')).getText().then(function(text) {
                    expect(text).toBe('Paris Saint Germain'); });
                expect(items[2].element(by.css('.run_title a')).getAttribute('href')).toEqual('http://localhost:9615/run-3');
                items[2].element(by.css('.run_desc .run_address')).getText().then(function(text) {
                    expect(text).toBe('Paris, France'); });
                items[2].element(by.css('.run_desc .run_type')).getText().then(function(text) {
                    expect(text).toBe('Retour'); });
                items[2].element(by.css('.run_desc .run_date')).getText().then(function(text) {
                    expect(text).toBe('02 / 08 / 2016'); });
                items[2].element(by.css('.run_desc .run_duration')).getText().then(function(text) {
                    expect(text).toBe('5 heures 38 minutes'); });
                items[2].element(by.css('.run_desc .run_distance')).getText().then(function(text) {
                    expect(text).toBe('652 km'); });
            });
            expect(element(by.css('.course .btn')).isPresent()).toBe(true);
            expect(element(by.css('.course .btn')).getAttribute('href')).toEqual('http://localhost:9615/run');
        });
    });

    describe('User journey', function() {

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
                    element(by.model('credentials.email')).clear();
                    element(by.model('credentials.email')).sendKeys('jbillay@gmail.com');
                    element(by.model('credentials.password')).clear();
                    element(by.model('credentials.password')).sendKeys('noofs');
                    element(by.id('connection')).click().then(function () {
                        browser.getLocationAbsUrl().then(function(url) {
                            expect(url).toBe('/');
                            element.all(by.css('.navbar-right li')).then(function(items) {
                                expect(items.length).toBe(12);
                            });
                        });
                    });
                });
            });
        });
    });
});
*/
