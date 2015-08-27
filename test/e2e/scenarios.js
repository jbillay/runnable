'use strict';

require('jasmine-given');

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

var IndexPage = require('./pages/index_page');
var JourneyPage = require('./pages/journey_page');
var RunPage = require('./pages/run_page');
var UserPublicProfilePage = require('./pages/userPublicProfile_page');

describe('Public journey', function() {
    var indexPage = new IndexPage();
    var journeyPage = new JourneyPage();
    var runPage = new RunPage();
    var userPublicProfilePage = new UserPublicProfilePage();

    describe('visiting the home page', function () {
        new Given(function() {
            indexPage.visitPage();
        });
        new Then(function() {
            indexPage.getTitle().then(function(text) {
                expect(text).toEqual('My Run Trip');
            });
            expect(indexPage.inscriptionForm.isPresent()).toBe(true);
            indexPage.journeyList.then(function (items) {
                expect(items.length).toBe(3);
                items.forEach(function (item) {
                    expect(item.element(by.css('.journey_map')).isPresent()).toBe(true);
                });
            });
            var data_journey = [
                {
                    'journey.Run.name': 'Maxi-Race ®',
                    'journey.address_start': 'Saint-Germain-En-Laye',
                    'journey.journey_type': 'Aller-Retour',
                    'journey.date_start_outward': '12 / 05 / 2016',
                    'journey.duration': '5 heures 16 minutes',
                    'journey.distance': '576 km'
                },
                {
                    'journey.Run.name': 'Les Templiers',
                    'journey.address_start': 'Nantes, France',
                    'journey.journey_type': 'Aller',
                    'journey.date_start_outward': '02 / 06 / 2016',
                    'journey.duration': '6 heures 36 minutes',
                    'journey.distance': '754 km'
                },
                {
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
                arr.forEach(function (line) {
                    var value = element(by.repeater('journey in listJourney').row(index).column(line));
                    value.getText().then(function (text) { expect(text).toEqual(item[line]);});
                });
            });
            expect(indexPage.journeyBtn.isPresent()).toBe(true);
            expect(indexPage.journeyBtn.getAttribute('href')).toEqual('http://localhost:9615/journey');
            indexPage.runList.then(function (items) {
                expect(items.length).toBe(4);
                items.forEach(function (item) {
                    expect(item.element(by.css('.run_img')).isPresent()).toBe(true);
                });
            });
            var data_run = [
                {
                    'run.name': 'Ice Trail Tarentaise',
                    'run.address_start': 'Val-D\'isère, France',
                    'run.date_start': '12 / 07 / 2016',
                    'run.distances': '65km - 32km - 18km',
                    'run.type': 'Trail'
                },
                {
                    'run.name': 'Marathon Du Mont Blanc',
                    'run.address_start': 'Chamonix, France',
                    'run.date_start': '28 / 06 / 2016',
                    'run.distances': '80km - 42km - 23km - 10km -',
                    'run.type': 'Marathon'
                },
                {
                    'run.name': 'Trail Des Ragondins',
                    'run.address_start': 'Cantenay-ÉPinard, Fra',
                    'run.date_start': '14 / 06 / 2016',
                    'run.distances': '37km - 17km - 9km - 5km',
                    'run.type': 'Trail'
                },
                {
                    'run.name': 'Maxi-Race ®',
                    'run.address_start': 'Annecy-Le-Vieux, Fran',
                    'run.date_start': '30 / 05 / 2016',
                    'run.distances': '87km - 86km - 43km - 15km -',
                    'run.type': 'Trail'
                }
            ];
            data_run.forEach(function (item, index) {
                var arr = Object.keys(item);
                arr.forEach(function (line) {
                    var value = element(by.repeater('run in listRun').row(index).column(line));
                    value.getText().then(function (text) { expect(text).toEqual(item[line]);});
                });
            });
            expect(indexPage.runBtn.isPresent()).toBe(true);
            expect(indexPage.runBtn.getAttribute('href')).toEqual('http://localhost:9615/run');
        });
    });

    describe('Go the journey page', function () {
        new Given(function() {
            indexPage.visitPage();
        });
        new When(function () {
            indexPage.journeyBtn.click();
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/journey');
                journeyPage.journeyList.then(function(items) {
                    expect(items.length).toBe(3);
                });
            });
        });
    });

    describe('Check a journey page - for Maxi-Race run', function () {
        new Given(function() {
            indexPage.visitPage();
        });
        new When(function () {
            element(by.repeater('journey in listJourney').row(0).column('journey.Run.name')).click();
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/journey-4');
                journeyPage.journeyHeader.getText().then(
                    function (text) {
                        expect(text).toEqual('Parcours pour la course MaXi-Race ®');
                    });
                expect(journeyPage.journeyRunName.getAttribute('href')).toEqual('http://localhost:9615/run-16');
                journeyPage.joinBtn.getText().then(
                    function (text) {
                        expect(text).toEqual('Participer à ce voyage');
                    });
                journeyPage.startFrom.getText().then(
                    function (text) {
                        expect(text).toEqual('Départ de Saint-Germain-en-Laye, France');
                    });
                expect(journeyPage.journeyUser.getAttribute('href')).toEqual('http://localhost:9615/user-1');
                journeyPage.journeyUser.getText().then(
                    function (text) {
                        expect(text).toEqual('Jeremy Billay');
                    });
                journeyPage.journeyCarType.getText().then(
                    function (text) {
                        expect(text).toEqual('Monospace');
                    });
                journeyPage.journeyPrice.getText().then(
                    function (text) {
                        expect(text).toEqual('€ 39.00');
                    });
                journeyPage.journeyDistance.getText().then(
                    function (text) {
                        expect(text).toEqual('576 km');
                    });
                journeyPage.journeyDuration.getText().then(
                    function (text) {
                        expect(text).toEqual('5 heures 16 minutes');
                    });
                journeyPage.journeyPublicMessages.then(
                    function (items) {
                        expect(items.length).toBe(3);
                    });
                journeyPage.journeyOutwardDate.getText().then(
                    function (text) {
                        expect(text).toEqual('12/05/2016 06:00');
                    });
                journeyPage.journeyOutwardFreeSpace.getText().then(
                    function (text) {
                        expect(text).toEqual('4 place(s)');
                    });
                journeyPage.journeyReturnDate.getText().then(
                    function (text) {
                        expect(text).toEqual('13/05/2016 15:30');
                    });
                journeyPage.journeyReturnFreeSpace.getText().then(
                    function (text) {
                        expect(text).toEqual('4 place(s)');
                    });
            });
        });
    });

    describe('Go the run page', function () {
        new Given(function() {
            indexPage.visitPage();
        });
        new When(function () {
            indexPage.runBtn.click();
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/run');
                runPage.runList.then(function(items) {
                    expect(items.length).toBe(19);
                });
            });
        });
    });

    describe('Check a run page - Ice Trail Tarentaise run', function () {
        new Given(function() {
            indexPage.visitPage();
        });
        new When(function () {
            element(by.repeater('run in listRun').row(0).column('run.name')).click();
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/run-19');
                runPage.runName.getText().then(
                    function (text) { expect(text).toEqual('Ice Trail Tarentaise'); });
                runPage.runActionButtons.then(function (items) {
                    expect(items.length).toBe(2); });
                runPage.runCreateJourneyButton.getText().then(function (text) {
                    expect(text).toEqual('Proposer un parcours'); });
                runPage.runAddAgendaButton.getText().then(function (text) {
                    expect(text).toEqual('Ajouter à mon agenda'); });
                runPage.runAddressStart.getText().then(function (text) {
                    expect(text).toEqual('Val-D\'isère, France'); });
                runPage.runDateStart.getText().then(function (text) {
                    expect(text).toEqual('12 / 07 / 2016'); });
                runPage.runTimeStart.getText().then(function (text) {
                    expect(text).toEqual('06:15'); });
                runPage.runType.getText().then(function (text) {
                    expect(text).toEqual('Trail'); });
                runPage.runDistances.getText().then(function (text) {
                    expect(text).toEqual('65km - 32km - 18km'); });
                runPage.runElevations.getText().then(function (text) {
                    expect(text).toEqual('2651+'); });
                expect(runPage.runNoJourney.isDisplayed()).toBeTruthy();
                expect(runPage.runMap.isPresent()).toBeTruthy();
            });
        });
    });

    describe('Go the user public profile page', function () {
        var creation = new Date(2014, 11, 10, 17, 17, 25).getTime(),
            today = new Date().getTime(),
            diff = parseInt((today-creation)/(24*3600*1000)) + 1;
        new Given(function() {
            userPublicProfilePage.visitPage(1);
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/user-1');
                expect(userPublicProfilePage.userPicture.getAttribute('src')).toMatch('avatar_1.jpg');
                userPublicProfilePage.userName.getText().then(function (text) {
                    expect(text).toEqual('Jeremy Billay'); });
                userPublicProfilePage.userAddress.getText().then(function (text) {
                    expect(text).toEqual('1 bis rue Saint Pierre 78100 Saint Germain en Laye'); });
                userPublicProfilePage.userHistory.getText().then(function (text) {
                    expect(text).toEqual('Inscrit(e) depuis ' + diff + ' jour(s)'); });
                userPublicProfilePage.userOrg.getText().then(function (text) {
                    expect(text).toEqual('3 voyage(s) organisé(s)'); });
                userPublicProfilePage.userPart.getText().then(function (text) {
                    expect(text).toEqual('2 participation(s) à un voyage'); });
                userPublicProfilePage.userRate.getText().then(function (text) {
                    expect(text).toEqual('3 / 5'); });
                userPublicProfilePage.userComments.then(function (items) {
                    expect(items.length).toBe(1); });
                userPublicProfilePage.userRunsPart.then(function (items) {
                    expect(items.length).toBe(5); });
            });
        });
    });
});

describe('User journey', function() {
    var runPage = new RunPage();
    var journeyPage = new JourneyPage();

    describe('Check a Maxi-Race run page', function () {
        new Given(function() {
            runPage.visitPage(16);
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/run-16');
                runPage.runName.getText().then(
                    function (text) { expect(text).toEqual('MaXi-Race ®'); });
                runPage.runActionButtons.then(function (items) {
                    expect(items.length).toBe(2); });
                runPage.runCreateJourneyButton.getText().then(function (text) {
                    expect(text).toEqual('Proposer un parcours'); });
                runPage.runAddAgendaButton.getText().then(function (text) {
                    expect(text).toEqual('Ajouter à mon agenda'); });
                runPage.runAddressStart.getText().then(function (text) {
                    expect(text).toEqual('Annecy-Le-Vieux, France'); });
                runPage.runDateStart.getText().then(function (text) {
                    expect(text).toEqual('30 / 05 / 2016'); });
                runPage.runTimeStart.getText().then(function (text) {
                    expect(text).toEqual('06:15'); });
                runPage.runType.getText().then(function (text) {
                    expect(text).toEqual('Trail'); });
                runPage.runDistances.getText().then(function (text) {
                    expect(text).toEqual('87km - 86km - 43km - 15km - 7km'); });
                runPage.runElevations.getText().then(function (text) {
                    expect(text).toEqual('2895+'); });
                expect(runPage.runMap.isPresent()).toBeTruthy();
                runPage.runJourneyList.then(function (items) {
                    expect(items.length).toBe(1);
                    expect(items[0].element(by.css('.journey_link')).getAttribute('href')).toEqual('http://localhost:9615/journey-4');
                    items[0].element(by.css('.journey_type')).getText().then(
                        function (text) { expect(text).toEqual('Aller-Retour'); });
                    items[0].element(by.css('.journey_start_outward')).getText().then(
                        function (text) { expect(text).toEqual('12/05/2016 06:00'); });
                    items[0].element(by.css('.journey_space_outward')).getText().then(
                        function (text) { expect(text).toEqual('4 place(s)'); });
                    items[0].element(by.css('.journey_start_return')).getText().then(
                        function (text) { expect(text).toEqual('13/05/2016 15:30'); });
                    items[0].element(by.css('.journey_space_return')).getText().then(
                        function (text) { expect(text).toEqual('4 place(s)'); });
                    items[0].element(by.css('.journey_price')).getText().then(
                        function (text) { expect(text).toEqual('€ 39.00'); });
                });
            });
        });
    });
    describe('Check the first journey for Maxi-Race', function () {
        new Given(function() {
            runPage.visitPage(16);
        });
        new When(function () {
            runPage.runJourneyList.then(function (items) {
                items[0].element(by.css('.journey_link')).click();
            });
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/journey-4');
            });
        });
    });
    describe('Check public profile page of first journey for Maxi-Race', function () {
        new Given(function() {
            journeyPage.visitPage(4);
        });
        new When(function () {
            journeyPage.journeyUser.click();
        });
        new Then(function () {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/user-1');
            });
        });
    });
});

describe('User journey', function() {
    var indexPage = new IndexPage();
    describe('Login in Home Page', function () {
        new Given(function() {
            indexPage.visitPage();
        });
        new Given(function() {
            indexPage.openLoginForm();
        });
        new Given(function() {
            indexPage.fillEmail('jbillay@gmail.com');
        });
        new Given(function() {
            indexPage.fillPassword('noofs');
        });
        new When(function() {
            indexPage.login();
        });
        new Then(function() {
            browser.getLocationAbsUrl().then(function(url) {
                expect(url).toBe('/');
                browser.waitForAngular();
                element.all(by.css('.navbar-right li')).then(function(items) {
                    expect(items.length).toBe(12);
                });
            });
        });
    });
});
