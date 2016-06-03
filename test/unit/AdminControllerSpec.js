'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableAdminController', function(){
        var scope, rootScope, ctrl, ctrlLogin, ctrlMain, location, $httpBackend, AUTH_EVENTS;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $location, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            location = $location;
            AUTH_EVENTS = {
                loginSuccess: 'auth-login-success',
                loginFailed: 'auth-login-failed',
                logoutSuccess: 'auth-logout-success',
                sessionTimeout: 'auth-session-timeout',
                notAuthenticated: 'auth-not-authenticated',
                notAuthorized: 'auth-not-authorized'
            };
            var user = {
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                hashedPassword: 'qksdjlqjdlsjqls',
                provider: 'local',
                salt: 'skjdljqld',
                itra: null,
                isActive: 1,
                role: 'admin',
                picture: null,
                Inboxes: [{
                    id: 1,
                    title: 'Nouveau message concernant le trajet pour la course Les templiers',
                    message: 'test à la con',
                    is_read: 1
                }]
            };
            $httpBackend.whenPOST('/login').respond({msg: user, type: 'success'});
            $httpBackend.whenGET('/api/user/runs').respond('HTML');
            $httpBackend.whenGET('/api/user/me').respond({
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: 'test'
            });
            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);
            $httpBackend.whenGET('/api/admin/users').respond([{
                id: 1,
                firstname: 'Jeremy',
                lastname: 'Billay',
                address: 'Saint Germain en laye',
                phone: '0689876547',
                email: 'jbillay@gmail.com',
                hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                provider: 'local',
                salt: 'T75xyNJfL19hzc778A08HQ==',
                itra: null,
                isActive: 1,
                role: 'editor',
                picture: null
            },{
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                hashedPassword: 'VMcLEoVLvXdolDlsRzF8cVjo2swFfV1Mo76ycRKObI00pVfBy73IwlYj/mX3Z+PH873k57Gu8vWCbWo9v/Cxuw==',
                provider: 'local',
                salt: 'd36OGvube+jUO8lcBpmr+Q==',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: null,
                createdAt: '2015-02-04 18:55:39',
                updatedAt: '2015-02-04 18:55:39'
            }]);
            $httpBackend.whenGET('/api/admin/runs').respond({msg: [{
                id: 1,
                name: 'Maxicross',
                type: 'trail',
                address_start: 'Bouffémont, France',
                date_start: '2015-02-02 00:00:00',
                time_start: '09:15',
                distances: '15k - 30k - 7k',
                elevations: '500+ - 1400+',
                info: 'Toutes les infos sur le maxicross',
                is_active: 1
            },
                {
                    id: 2,
                    name: 'Les templiers',
                    type: 'trail',
                    address_start: 'Millau, France',
                    date_start: '2015-09-15 00:00:00',
                    time_start: '06:30',
                    distances: '72km',
                    elevations: '2500+',
                    info: 'ksdjlsdjlf jsdlfjl sjdflj',
                    is_active: 1
                }], type: 'success'});
            $httpBackend.whenGET('/api/admin/journeys').respond([{
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-09-06 00:00:00',
                time_start_outward: '06:00',
                nb_space_outward: 2,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1
            }, {
                id: 2,
                address_start: 'Nantes, France',
                distance: '754 km',
                duration: '6 heures 36 minute',
                journey_type: 'aller',
                date_start_outward: '2015-06-02 00:00:00',
                time_start_outward: '03:00',
                nb_space_outward: 2,
                date_start_return: null,
                time_start_return: null,
                nb_space_return: null,
                car_type: 'citadine',
                amount: 32,
                is_canceled: true,
                updatedAt: '2014-12-22 13:41:38',
                RunId: 2,
                UserId: 1
            }]);
            $httpBackend.whenGET('/api/admin/joins').respond([{
                id: 1,
                nb_place_outward: 2,
                nb_place_return: 2,
                UserId: 1,
                JourneyId: 1,
                Invoice: {
                    amount: 23,
                    fees: 4,
                    status: 'completed'
                }
            },
                {
                    id: 2,
                    nb_place_outward: 1,
                    nb_place_return: null,
                    UserId: 1,
                    JourneyId: 1,
                    Invoice: {
                        amount: 12,
                        fees: 1,
                        status: 'completed'
                    }
                },
                {
                    id: 3,
                    nb_place_outward: 1,
                    nb_place_return: null,
                    UserId: 2,
                    JourneyId: 2,
                    Invoice: {
                        amount: 67,
                        fees: 12,
                        status: 'completed'
                    }
                }]);
            $httpBackend.whenGET('/api/admin/journey/toPay').respond([
                {
                    id: 1,
                    address_start: 'Paris, France',
                    distance: null,
                    duration: null,
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-12-03T23:00:00.000Z',
                    time_start_outward: '12:10',
                    nb_space_outward: 2,
                    date_start_return: '2015-12-04T23:00:00.000Z',
                    time_start_return: '00:59',
                    nb_space_return: 2,
                    car_type: 'break',
                    amount: 25,
                    is_payed: false,
                    is_canceled: false,
                    createdAt: '2015-12-02T12:13:55.000Z',
                    updatedAt: '2015-12-02T12:13:55.000Z',
                    RunId: 43,
                    UserId: 1,
                    PartnerId: null,
                    User: {
                        id: 1,
                        firstname: 'Jeremy',
                        lastname: 'Billay',
                        address: 'Chantilly',
                        phone: null,
                        email: 'jbillay@gmail.com',
                        hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                        provider: 'local',
                        salt: 'T75xyNJfL19hzc778A08HQ==',
                        itra: null,
                        isActive: true,
                        role: 'admin',
                        picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                        createdAt: '2014-12-10T17:17:25.000Z',
                        updatedAt: '2016-03-31T10:57:48.000Z'
                    },
                    Run: {
                        id: 43,
                        name: 'Saintélyon',
                        slug: null,
                        type: 'trail',
                        address_start: 'Saint-Étienne, France',
                        date_start: '2015-12-05T23:00:00.000Z',
                        time_start: '00:00',
                        distances: '72km',
                        elevations: '1800',
                        info: 'http://www.saintelyon.com/\t\t\t\t\t',
                        is_active: true,
                        createdAt: '2015-06-04T14:15:58.000Z',
                        updatedAt: '2015-06-04T16:32:55.000Z',
                        UserId: 2
                    },
                    Joins: [
                        {
                            id: 1,
                            nb_place_outward: 1,
                            nb_place_return: 1,
                            createdAt: '2015-12-02T14:47:23.000Z',
                            updatedAt: '2015-12-02T14:47:23.000Z',
                            UserId: 1,
                            JourneyId: 1,
                            Invoice: {
                                id: 1,
                                status: 'completed',
                                amount: 50,
                                fees: 0,
                                ref: 'MRT20151202CIVGD',
                                transaction: '822731012',
                                driver_payed: false,
                                createdAt: '2015-12-02T14:47:23.000Z',
                                updatedAt: '2015-12-02T14:52:34.000Z',
                                UserId: 1,
                                JourneyId: 1,
                                JoinId: 1
                            },
                            ValidationJourney: {
                                id: 2,
                                comment_driver: 'qqsdqs',
                                comment_service: 'eezrzerz',
                                rate_driver: 2,
                                rate_service: 4,
                                createdAt: '2016-03-31T11:02:43.000Z',
                                updatedAt: '2016-03-31T11:02:43.000Z',
                                JoinId: 1,
                                UserId: 1
                            },
                            validated: true,
                            User: {
                                id: 1,
                                firstname: 'Jeremy',
                                lastname: 'Billay',
                                address: 'Chantilly',
                                phone: null,
                                email: 'jbillay@gmail.com',
                                hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                                provider: 'local',
                                salt: 'T75xyNJfL19hzc778A08HQ==',
                                itra: null,
                                isActive: true,
                                role: 'admin',
                                picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                                createdAt: '2014-12-10T17:17:25.000Z',
                                updatedAt: '2016-03-31T10:57:48.000Z'
                            }
                        }
                    ],
                    dateToPay: '4 months ago',
                    nbJourney: 1,
                    nbValidatedJourney: 1,
                    amountToPay: 50
                },
                {
                    id: 143,
                    address_start: 'Nantes, France',
                    distance: '914 km',
                    duration: '8 heures 23 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2016-03-25T23:00:00.000Z',
                    time_start_outward: '12:00',
                    nb_space_outward: 2,
                    date_start_return: '2016-03-25T23:00:00.000Z',
                    time_start_return: '03:15',
                    nb_space_return: 1,
                    car_type: 'monospace',
                    amount: 12,
                    is_payed: false,
                    is_canceled: false,
                    createdAt: '2016-03-16T20:22:39.000Z',
                    updatedAt: '2016-03-16T20:22:39.000Z',
                    RunId: 72,
                    UserId: 1,
                    PartnerId: null,
                    User: {
                        id: 1,
                        firstname: 'Jeremy',
                        lastname: 'Billay',
                        address: 'Chantilly',
                        phone: null,
                        email: 'jbillay@gmail.com',
                        hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                        provider: 'local',
                        salt: 'T75xyNJfL19hzc778A08HQ==',
                        itra: null,
                        isActive: true,
                        role: 'admin',
                        picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                        createdAt: '2014-12-10T17:17:25.000Z',
                        updatedAt: '2016-03-31T10:57:48.000Z'
                    },
                    Run: {
                        id: 72,
                        name: 'Trail de la Drôme',
                        slug: 'trail-de-la-drome',
                        type: 'trail',
                        address_start: 'Buis-les-Baronnies, France',
                        date_start: '2016-04-16T22:00:00.000Z',
                        time_start: '07:00',
                        distances: '10km - 22km - 40km',
                        elevations: '500D+ - 930D+ - 1740D+',
                        info: 'http://www.traildrome.fr',
                        is_active: true,
                        createdAt: '2015-11-04T15:41:56.000Z',
                        updatedAt: '2015-11-04T16:22:36.000Z',
                        UserId: 2
                    },
                    Joins: [
                        {
                            id: 12,
                            nb_place_outward: 1,
                            nb_place_return: 1,
                            createdAt: '2016-03-21T21:40:05.000Z',
                            updatedAt: '2016-03-21T21:40:05.000Z',
                            UserId: 1,
                            JourneyId: 143,
                            Invoice: {
                                id: 12,
                                status: 'completed',
                                amount: 28.88,
                                fees: 4.88,
                                ref: 'MRT20160321PJHFU',
                                transaction: null,
                                driver_payed: false,
                                createdAt: '2016-03-21T21:40:05.000Z',
                                updatedAt: '2016-03-21T21:40:05.000Z',
                                UserId: 1,
                                JourneyId: 143,
                                JoinId: 12
                            },
                            ValidationJourney: null,
                            validated: false,
                            User: {
                                id: 1,
                                firstname: 'Jeremy',
                                lastname: 'Billay',
                                address: 'Chantilly',
                                phone: null,
                                email: 'jbillay@gmail.com',
                                hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                                provider: 'local',
                                salt: 'T75xyNJfL19hzc778A08HQ==',
                                itra: null,
                                isActive: true,
                                role: 'admin',
                                picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                                createdAt: '2014-12-10T17:17:25.000Z',
                                updatedAt: '2016-03-31T10:57:48.000Z'
                            }
                        }
                    ],
                    dateToPay: '12 days ago',
                    nbJourney: 1,
                    nbValidatedJourney: 0,
                    amountToPay: 24
                },
                {
                    id: 149,
                    address_start: 'Tours, France',
                    distance: '240 km',
                    duration: '2 heures 23 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2016-04-02T22:00:00.000Z',
                    time_start_outward: '04:45',
                    nb_space_outward: 1,
                    date_start_return: '2016-04-02T22:00:00.000Z',
                    time_start_return: '15:45',
                    nb_space_return: 2,
                    car_type: 'break',
                    amount: 12,
                    is_payed: false,
                    is_canceled: false,
                    createdAt: '2016-03-26T14:58:17.000Z',
                    updatedAt: '2016-03-26T14:58:17.000Z',
                    RunId: 55,
                    UserId: 1,
                    PartnerId: null,
                    User: {
                        id: 1,
                        firstname: 'Jeremy',
                        lastname: 'Billay',
                        address: 'Chantilly',
                        phone: null,
                        email: 'jbillay@gmail.com',
                        hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                        provider: 'local',
                        salt: 'T75xyNJfL19hzc778A08HQ==',
                        itra: null,
                        isActive: true,
                        role: 'admin',
                        picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                        createdAt: '2014-12-10T17:17:25.000Z',
                        updatedAt: '2016-03-31T10:57:48.000Z'
                    },
                    Run: {
                        id: 55,
                        name: 'Marathon de Paris',
                        slug: 'marathon-de-paris',
                        type: 'marathon',
                        address_start: 'Paris, France',
                        date_start: '2016-04-02T22:00:00.000Z',
                        time_start: '08:00',
                        distances: '42km',
                        elevations: null,
                        info: 'http://www.schneiderelectricparismarathon.com',
                        is_active: true,
                        createdAt: '2015-07-05T14:53:46.000Z',
                        updatedAt: '2015-07-05T14:55:12.000Z',
                        UserId: 2
                    },
                    Joins: [
                        {
                            id: 13,
                            nb_place_outward: 1,
                            nb_place_return: 2,
                            createdAt: '2016-04-01T06:04:49.000Z',
                            updatedAt: '2016-04-01T06:04:49.000Z',
                            UserId: 1,
                            JourneyId: 149,
                            Invoice: {
                                id: 13,
                                status: 'completed',
                                amount: 43.32,
                                fees: 7.32,
                                ref: 'MRT201604010VB46',
                                transaction: null,
                                driver_payed: false,
                                createdAt: '2016-04-01T06:04:49.000Z',
                                updatedAt: '2016-04-01T06:04:49.000Z',
                                UserId: 1,
                                JourneyId: 149,
                                JoinId: 13
                            },
                            ValidationJourney: null,
                            validated: false,
                            User: {
                                id: 1,
                                firstname: 'Jeremy',
                                lastname: 'Billay',
                                address: 'Chantilly',
                                phone: null,
                                email: 'jbillay@gmail.com',
                                hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                                provider: 'local',
                                salt: 'T75xyNJfL19hzc778A08HQ==',
                                itra: null,
                                isActive: true,
                                role: 'admin',
                                picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                                createdAt: '2014-12-10T17:17:25.000Z',
                                updatedAt: '2016-03-31T10:57:48.000Z'
                            }
                        }
                    ],
                    dateToPay: '4 days ago',
                    nbJourney: 1,
                    nbValidatedJourney: 0,
                    amountToPay: 36
                },
                {
                    id: 155,
                    address_start: 'Tours, France',
                    distance: '719 km',
                    duration: '6 heures 42 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2016-04-15T22:00:00.000Z',
                    time_start_outward: '12:08',
                    nb_space_outward: 2,
                    date_start_return: '2016-04-22T22:00:00.000Z',
                    time_start_return: '23:07',
                    nb_space_return: 2,
                    car_type: 'break',
                    amount: 13,
                    is_payed: false,
                    is_canceled: false,
                    createdAt: '2016-04-05T20:59:11.000Z',
                    updatedAt: '2016-04-05T20:59:11.000Z',
                    RunId: 72,
                    UserId: 1,
                    PartnerId: null,
                    User: {
                        id: 1,
                        firstname: 'Jeremy',
                        lastname: 'Billay',
                        address: 'Chantilly',
                        phone: null,
                        email: 'jbillay@gmail.com',
                        hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                        provider: 'local',
                        salt: 'T75xyNJfL19hzc778A08HQ==',
                        itra: null,
                        isActive: true,
                        role: 'admin',
                        picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                        createdAt: '2014-12-10T17:17:25.000Z',
                        updatedAt: '2016-03-31T10:57:48.000Z'
                    },
                    Run: {
                        id: 72,
                        name: 'Trail de la Drôme',
                        slug: 'trail-de-la-drome',
                        type: 'trail',
                        address_start: 'Buis-les-Baronnies, France',
                        date_start: '2016-04-16T22:00:00.000Z',
                        time_start: '07:00',
                        distances: '10km - 22km - 40km',
                        elevations: '500D+ - 930D+ - 1740D+',
                        info: 'http://www.traildrome.fr',
                        is_active: true,
                        createdAt: '2015-11-04T15:41:56.000Z',
                        updatedAt: '2015-11-04T16:22:36.000Z',
                        UserId: 2
                    },
                    Joins: [
                        {
                            id: 14,
                            nb_place_outward: 1,
                            nb_place_return: 2,
                            createdAt: '2016-04-05T20:59:54.000Z',
                            updatedAt: '2016-04-05T20:59:54.000Z',
                            UserId: 2,
                            JourneyId: 155,
                            Invoice: {
                                id: 14,
                                status: 'completed',
                                amount: 46.68,
                                fees: 7.68,
                                ref: 'MRT201604053QRK4',
                                transaction: 'TOBECOMPLETEMANUALY',
                                driver_payed: false,
                                createdAt: '2016-04-05T20:59:54.000Z',
                                updatedAt: '2016-04-06T12:24:21.000Z',
                                UserId: 2,
                                JourneyId: 155,
                                JoinId: 14
                            },
                            ValidationJourney: null,
                            validated: false,
                            User: {
                                id: 2,
                                firstname: 'Richard',
                                lastname: 'Couret',
                                address: 'Bouffemont',
                                phone: null,
                                email: 'richard.couret@free.fr',
                                hashedPassword: 'VMcLEoVLvXdolDlsRzF8cVjo2swFfV1Mo76ycRKObI00pVfBy73IwlYj/mX3Z+PH873k57Gu8vWCbWo9v/Cxuw==',
                                provider: 'local',
                                salt: 'd36OGvube+jUO8lcBpmr+Q==',
                                itra: null,
                                isActive: true,
                                role: 'editor',
                                picture: null,
                                createdAt: '2015-01-13T12:04:47.000Z',
                                updatedAt: '2015-01-13T12:04:47.000Z'
                            }
                        }
                    ],
                    dateToPay: 'in 16 days',
                    nbJourney: 1,
                    nbValidatedJourney: 0,
                    amountToPay: 39
                }
            ]);
            $httpBackend.whenGET('/api/admin/join/toRefund').respond({
                msg: [
                    {
                        id: 13,
                        nb_place_outward: 1,
                        nb_place_return: 1,
                        createdAt: '2016-05-15T20:34:47.000Z',
                        updatedAt: '2016-05-15T20:34:47.000Z',
                        UserId: 1,
                        JourneyId: null,
                        Journey: null,
                        User: {
                            id: 1,
                            firstname: 'Jeremy',
                            lastname: 'Billay',
                            address: '1 bis rue Saint Pierre 78100 Saint Germain en Laye',
                            phone: null,
                            email: 'jbillay@gmail.com',
                            hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                            provider: 'local',
                            salt: 'T75xyNJfL19hzc778A08HQ==',
                            itra: null,
                            isActive: true,
                            role: 'admin',
                            picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                            createdAt: '2014-12-10T17:17:25.000Z',
                            updatedAt: '2015-03-27T02:38:09.000Z'
                        },
                        Invoice: {
                            id: 13,
                            status: 'cancelled',
                            amount: 19.52,
                            fees: 3.52,
                            ref: 'MRT20160515JR8UY',
                            transaction: null,
                            driver_payed: false,
                            createdAt: '2016-05-15T20:34:47.000Z',
                            updatedAt: '2016-05-31T05:52:36.000Z',
                            UserId: 1,
                            JourneyId: null,
                            JoinId: 13
                        }
                    }
                ],
                type: 'success'
            });
            $httpBackend.whenGET('/api/admin/partners').respond({msg: [
                { id: 1, name: 'TCC', token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNDgsImV4cCI6MTIwNTA5NjA2NjF9.-vmI9gHnCFX30N2oVhQLiADX-Uz2XHzrHjWjJpvSERo',expiry: '2016-03-09', fee: 6.8 },
                { id: 2, name: 'I-Run', token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU3QtWW9ycmUiLCJpYXQiOjE0NDYwMDkwNjcsImV4cCI6MTIwNTA5NDE5NzR9.fikQ6L2eYUBujEeV-OYMFfX_pER5eC2Z_nQJ0YVyb9w', expiry: '2017-07-09', fee: 8.2 }
            ], type: 'success'});
            $httpBackend.whenGET('/api/admin/options').respond({
                emailTemplate: [{id:1, name:'test', key:'test', title:'tbd', html:'tdb'}],
                mailConfig: {host:'ovh', user:'root', password:'root'}
            });
            $httpBackend.whenGET('/api/admin/fees').respond({msg: [
                    {
                        RunId: 1,
                        UserId: null,
                        code: null,
                        createdAt: '0000-00-00 00:00:00',
                        default:false,
                        discount: 0.05,
                        end_date: '2016-12-06T00:00:00.000Z',
                        id: 2,
                        percentage: null,
                        remaining: null,
                        start_date: '0000-00-00 00:00:00',
                        updatedAt: '0000-00-00 00:00:00',
                        value: null
                    },
                    {
                        RunId: null,
                        UserId: 1,
                        code: null,
                        createdAt: '0000-00-00 00:00:00',
                        default: false,
                        discount: 0.1,
                        end_date: null,
                        id: 4,
                        percentage: null,
                        remaining: null,
                        start_date: '0000-00-00 00:00:00',
                        updatedAt: '0000-00-00 00:00:00',
                        value: null
                    },
                    {
                        RunId: null,
                        UserId: null,
                        code: 'MRT-JR-2016',
                        createdAt: '2016-04-21T00:00:00.000Z',
                        default: false,
                        discount: 0.2,
                        end_date: null,
                        id: 8,
                        percentage: null,
                        remaining: 5,
                        start_date: '2015-12-08T00:00:00.000Z',
                        updatedAt: '2016-04-21T00:00:00.000Z',
                        value: null
                    }
                ], type: 'success'});
            $httpBackend.whenGET('/api/admin/default/fee').respond({msg: {
                RunId: null,
                UserId: null,
                code: null,
                createdAt: '2016-04-19T19:03:26.000Z',
                default: true,
                discount: null,
                end_date: null,
                id: 12,
                percentage: 13,
                remaining: null,
                start_date: '0000-00-00 00:00:00',
                updatedAt: '2016-04-19T19:03:26.000Z',
                value: 1
            }, type: 'success'});
            $httpBackend.whenGET('/api/admin/pages').respond([
                { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 },
                { id: 2, title: 'Page pour toto', tag: 'toto', content: 'ENCORE UN TEST', is_active: false }
            ]);
            $httpBackend.whenGET('/api/version').respond('DEV');
            $httpBackend.whenPOST('/api/admin/user/active').respond({msg: 'userToggleActive', type: 'success'});
            $httpBackend.whenPOST('/api/admin/options').respond({msg: 'emailOptionsSaved', type: 'success'});
            $httpBackend.whenPOST('/api/user/password/reset').respond({msg: 'passwordReset', type: 'success'});
            $httpBackend.whenPOST('/api/admin/page').respond({msg: 'pageSaved', type: 'success'});
            $httpBackend.whenPOST('/api/admin/run/active').respond({msg: 'done', type: 'success'});
            $httpBackend.whenPOST('/api/admin/partner/info').respond({msg: 'Partner info sent', type: 'success'});
            $httpBackend.whenPOST('/api/admin/partner').respond({msg: {
                UserId: 1,
                createdAt: '2015-12-21T08:37:49.000Z',
                expiry: '2015-12-25T23:00:00.000Z',
                fee: '6.9',
                id: 7,
                name: 'qsdqsdqsd',
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoicXNkcXNkcXNkIiwiaWF0IjoxNDUwNjg3MDY5fQ.BqKz4yQxEyhS_vhh0aVNH_jrTYFcH1EVmx-YojFXUHM',
                updatedAt: '2015-12-21T08:37:49.000Z'
            }, type: 'success'});
            $httpBackend.whenGET('/api/admin/user/bankaccount/1').respond(
                { id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 });

            ctrlMain = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope});
            ctrlLogin = $controller('RunnableLoginController',
                {$scope: scope, $rootScope: rootScope, AUTH_EVENTS: AUTH_EVENTS});
            ctrl = $controller('RunnableAdminController',
                {$scope: scope, $rootScope: rootScope, $location: location});
        }));

        it ('Start controller', function () {
            var credentials = {
                username: 'richard.couret@free.fr',
                password: 'richard'
            };
            spyOn(location, 'path');
            expect(scope.page).toEqual('Admin');
            scope.login(credentials);
            $httpBackend.flush();
            expect(location.path).toHaveBeenCalledWith('/');
        });

        it ('Toggle user activation', function () {
            var user = {
                    id: 2,
                    firstname: 'Richard',
                    lastname: 'Couret',
                    address: 'Bouffemont',
                    phone: '0689876547',
                    email: 'richard.couret@free.fr',
                    hashedPassword: 'qksdjlqjdlsjqls',
                    provider: 'local',
                    salt: 'skjdljqld',
                    itra: null,
                    isActive: 0,
                    role: 'admin'
                },
                user2 = {
                    id: 2,
                    firstname: 'Richard',
                    lastname: 'Couret',
                    address: 'Bouffemont',
                    phone: '0689876547',
                    email: 'richard.couret@free.fr',
                    hashedPassword: 'qksdjlqjdlsjqls',
                    provider: 'local',
                    salt: 'skjdljqld',
                    itra: null,
                    isActive: 1,
                    role: 'admin'
                };
            scope.userToggleActive(user);
            expect(user.isActive).toBeTruthy();
            scope.userToggleActive(user2);
            expect(user2.isActive).not.toBeTruthy();
            $httpBackend.flush();
        });

        it ('Save email options', function () {
            $httpBackend.flush();
            var emailOption = {
                emailTemplate: [{id:1, name:'new', key:'new', title:'new', html:'new'}],
                mailConfig: {host:'gandi', user:'myruntrip', password:'myruntrip'}
            };
            scope.submitEmailOptions(emailOption);
            $httpBackend.flush();
        });

        it ('Try to open calendar', function () {
            $httpBackend.flush();
            var e = jasmine.createSpyObj('e', [ 'preventDefault', 'stopPropagation' ]);
            scope.calendar.open(e);
            expect(scope.calendar.opened).toBeTruthy();
            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
        });

        it ('Cancel Journey', function () {
            var journey = {
                    id: 1,
                    address_start: 'Saint-Germain-en-Laye, France',
                    distance: '585 km',
                    duration: '5 heures 29 minutes',
                    journey_type: 'aller-retour',
                    date_start_outward: '2015-09-06 00:00:00',
                    time_start_outward: '06:00',
                    nb_space_outward: 2,
                    date_start_return: '2015-09-07 00:00:00',
                    time_start_return: '09:00',
                    nb_space_return: 3,
                    car_type: 'monospace',
                    amount: 23,
                    is_canceled: false,
                    updatedAt: '2014-12-22 09:08:16',
                    RunId: 5,
                    UserId: 1,
                    Run: {
                        name: 'Maxicross'
                    }
                },
                credentials = {
                    username: 'richard.couret@free.fr',
                    password: 'richard'
                };
            scope.login(credentials);
            $httpBackend.flush();
            scope.journeyCancel(journey);
        });

        it ('Edit Page', function () {
            var page = {
                id: 2,
                title: 'Page pour toto',
                tag: 'toto',
                content: 'ENCORE UN TEST',
                is_active: false
            };
            $httpBackend.flush();
            scope.editPage(page);
            expect(scope.editedPage).toEqual(page);
        });

        it ('Create a new page', function () {
            var origin = {
                newPageName: ''
            };
            scope.createPageForm = {
                newPageName: 'test a la con'
            };
            $httpBackend.flush();
            var nbPage = scope.pageList.length;
            scope.createPage();
            expect(scope.pageList.length).toBe(nbPage + 1);
            expect(scope.pageList[scope.pageList.length - 1].tag).toEqual('test-a-la-con');
        });

        it ('Save a page', function () {
            var page = {
                    id: 2,
                    title: 'Page pour toto',
                    tag: 'toto',
                    content: 'ENCORE UN TEST',
                    is_active: false
                };
            scope.saveEditPage(page);
            $httpBackend.flush();
        });

        it ('Edit user', function () {
            var user = {
                    id: 2,
                    firstname: 'Richard',
                    lastname: 'Couret',
                    address: 'Bouffemont',
                    phone: '0689876547',
                    email: 'richard.couret@free.fr',
                    hashedPassword: 'qksdjlqjdlsjqls',
                    provider: 'local',
                    salt: 'skjdljqld',
                    itra: null,
                    isActive: 0,
                    role: 'admin'
                };
            scope.userEdit(user);
            $httpBackend.flush();
        });

        it ('Save user', function () {
            var user = {
                    id: 2,
                    firstname: 'Richard',
                    lastname: 'Couret',
                    address: 'Bouffemont',
                    phone: '0689876547',
                    email: 'richard.couret@free.fr',
                    hashedPassword: 'qksdjlqjdlsjqls',
                    provider: 'local',
                    salt: 'skjdljqld',
                    itra: null,
                    isActive: 0,
                    role: 'admin'
                };
            scope.userSave(user);
            $httpBackend.flush();
        });

        it ('Reset user password', function () {
            var user = {
                    id: 2,
                    firstname: 'Richard',
                    lastname: 'Couret',
                    address: 'Bouffemont',
                    phone: '0689876547',
                    email: 'richard.couret@free.fr',
                    hashedPassword: 'qksdjlqjdlsjqls',
                    provider: 'local',
                    salt: 'skjdljqld',
                    itra: null,
                    isActive: 0,
                    role: 'admin'
                };
            scope.userResetPassword(user);
            $httpBackend.flush();
        });

        it ('Remove a user', function () {
            $httpBackend.flush();
            expect(scope.userList.length).toBe(2);
            scope.userTrash(0);
            expect(scope.userList.length).toBe(1);
        });

        it ('Activate a run', function () {
            var run = {
                    id: 2,
                    name: 'Les templiers',
                    type: 'trail',
                    address_start: 'Millau, France',
                    date_start: '2015-09-15 00:00:00',
                    time_start: '06:30',
                    distances: '72km',
                    elevations: '2500+',
                    info: 'ksdjlsdjlf jsdlfjl sjdflj',
                    is_active: 1
                },
                run2 = {
                    id: 2,
                    name: 'Les templiers',
                    type: 'trail',
                    address_start: 'Millau, France',
                    date_start: '2015-09-15 00:00:00',
                    time_start: '06:30',
                    distances: '72km',
                    elevations: '2500+',
                    info: 'ksdjlsdjlf jsdlfjl sjdflj',
                    is_active: 0
                };
            scope.runToggleActive(run);
            expect(run.is_active).not.toBeTruthy();
            scope.runToggleActive(run2);
            expect(run2.is_active).toBeTruthy();
            $httpBackend.flush();
        });

        it ('Toggle payment for a journey', function () {
            var journey = {
                id: 1,
                address_start: 'Saint-Germain-en-Laye, France',
                distance: '585 km',
                duration: '5 heures 29 minutes',
                journey_type: 'aller-retour',
                date_start_outward: '2015-09-06 00:00:00',
                time_start_outward: '06:00',
                nb_space_outward: 2,
                date_start_return: '2015-09-07 00:00:00',
                time_start_return: '09:00',
                nb_space_return: 3,
                car_type: 'monospace',
                amount: 23,
                is_canceled: false,
                updatedAt: '2014-12-22 09:08:16',
                RunId: 5,
                UserId: 1
            };
            $httpBackend.flush();
            scope.selectedJourney = journey;
            scope.journeyPayedToggle(true);
            expect(scope.selectedJourney.is_payed).not.toBeTruthy();
            scope.journeyPayedToggle(false);
            expect(scope.selectedJourney.is_payed).toBeTruthy();
        });

        it ('Open journey', function () {
            var journey = {
                id: 1,
                address_start: 'Paris, France',
                distance: null,
                duration: null,
                journey_type: 'aller-retour',
                date_start_outward: '2015-12-03T23:00:00.000Z',
                time_start_outward: '12:10',
                nb_space_outward: 2,
                date_start_return: '2015-12-04T23:00:00.000Z',
                time_start_return: '00:59',
                nb_space_return: 2,
                car_type: 'break',
                amount: 25,
                is_payed: false,
                is_canceled: false,
                createdAt: '2015-12-02T12:13:55.000Z',
                updatedAt: '2015-12-02T12:13:55.000Z',
                RunId: 43,
                UserId: 1,
                PartnerId: null,
                User: {
                    id: 1,
                    firstname: 'Jeremy',
                    lastname: 'Billay',
                    address: 'Chantilly',
                    phone: null,
                    email: 'jbillay@gmail.com',
                    hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                    provider: 'local',
                    salt: 'T75xyNJfL19hzc778A08HQ==',
                    itra: null,
                    isActive: true,
                    role: 'admin',
                    picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                    createdAt: '2014-12-10T17:17:25.000Z',
                    updatedAt: '2016-03-31T10:57:48.000Z'
                },
                Run: {
                    id: 43,
                    name: 'Saintélyon',
                    slug: null,
                    type: 'trail',
                    address_start: 'Saint-Étienne, France',
                    date_start: '2015-12-05T23:00:00.000Z',
                    time_start: '00:00',
                    distances: '72km',
                    elevations: '1800',
                    info: 'http://www.saintelyon.com/\t\t\t\t\t',
                    is_active: true,
                    createdAt: '2015-06-04T14:15:58.000Z',
                    updatedAt: '2015-06-04T16:32:55.000Z',
                    UserId: 2
                },
                Joins: [
                    {
                        id: 1,
                        nb_place_outward: 1,
                        nb_place_return: 1,
                        createdAt: '2015-12-02T14:47:23.000Z',
                        updatedAt: '2015-12-02T14:47:23.000Z',
                        UserId: 1,
                        JourneyId: 1,
                        Invoice: {
                            id: 1,
                            status: 'completed',
                            amount: 50,
                            fees: 0,
                            ref: 'MRT20151202CIVGD',
                            transaction: '822731012',
                            driver_payed: false,
                            createdAt: '2015-12-02T14:47:23.000Z',
                            updatedAt: '2015-12-02T14:52:34.000Z',
                            UserId: 1,
                            JourneyId: 1,
                            JoinId: 1
                        },
                        ValidationJourney: {
                            id: 2,
                            comment_driver: 'qqsdqs',
                            comment_service: 'eezrzerz',
                            rate_driver: 2,
                            rate_service: 4,
                            createdAt: '2016-03-31T11:02:43.000Z',
                            updatedAt: '2016-03-31T11:02:43.000Z',
                            JoinId: 1,
                            UserId: 1
                        },
                        validated: true,
                        User: {
                            id: 1,
                            firstname: 'Jeremy',
                            lastname: 'Billay',
                            address: 'Chantilly',
                            phone: null,
                            email: 'jbillay@gmail.com',
                            hashedPassword: '30I/772+OK6uQNdlaY8nriTbNSGznAk9un1zRIXmREB9nOjMz7wDDe2XpiS2ggk9En6lxR4SLqJyzAcW/rni3w==',
                            provider: 'local',
                            salt: 'T75xyNJfL19hzc778A08HQ==',
                            itra: null,
                            isActive: true,
                            role: 'admin',
                            picture: 'http://res.cloudinary.com/myruntrip/image/upload/v1459421867/avatar_development_1.jpg',
                            createdAt: '2014-12-10T17:17:25.000Z',
                            updatedAt: '2016-03-31T10:57:48.000Z'
                        }
                    }
                ],
                dateToPay: '4 months ago',
                nbJourney: 1,
                nbValidatedJourney: 1,
                amountToPay: 50
            };
            scope.openJourneyAction(journey);
            $httpBackend.flush();
            expect(scope.selectedJourney).toEqual(journey);
            expect(scope.selectedJourneyUserRIB).toEqual({ id: 1, owner: 'Jeremy Billay', agency_name: 'Crédit Agricole', IBAN: 'FR7618206000576025840255308', BIC: 'AGRIFRPP882', UserId: 1 });
            expect(scope.selectedJourney.Joins.length).toBe(1);
            expect(scope.selectedJourney.dateToPay).toEqual('4 months ago');
            expect(scope.selectedJourney.nbJourney).toBe(1);
            expect(scope.selectedJourney.nbValidatedJourney).toBe(1);
            expect(scope.selectedJourney.amountToPay).toBe(50);
            scope.closeAdminJourney();
        });

        it('Show partner form', function () {
            expect(scope.partnerCreation).toBeFalsy();
            $httpBackend.flush();
            scope.switchPartner();
            expect(scope.partnerCreation).toBeTruthy();
            scope.switchPartner();
            expect(scope.partnerCreation).toBeFalsy();
        });

        it('Create new partner', function () {
            var newPartner = {
                name: 'TOTO',
                fee: 7.8,
                expiry: '2017-09-15 00:00:00',
                user: {
                    name: 'test',
                    id: 1
                }
            };
            expect(scope.partnerCreation).toBeFalsy();
            $httpBackend.flush();
            scope.switchPartner();
            expect(scope.partnerCreation).toBeTruthy();
            scope.createPartner(newPartner);
            $httpBackend.flush();
            expect(scope.partnersList.length).toEqual(3);
            expect(scope.partnerCreation).toBeFalsy();
        });

        it('Send info to partner', function () {
            $httpBackend.flush();
            scope.sendInfoPartner(1);
            $httpBackend.flush();
        });


        it('Show email template form', function () {
            expect(scope.createTemplateEmail).toBeFalsy();
            $httpBackend.flush();
            scope.switchEmailTemplate();
            expect(scope.createTemplateEmail).toBeTruthy();
            scope.switchEmailTemplate();
            expect(scope.createTemplateEmail).toBeFalsy();
        });

        it('Create new email template', function () {
            $httpBackend.flush();
            var newTemplate = {
                id: scope.emailOption.emailTemplate.length + 1,
                name: 'unitTestAngular',
                key: ['test', 'unit', 'angular'],
                title: 'TBD',
                html: 'TBD'
            };
            expect(scope.createTemplateEmail).toBeFalsy();
            scope.switchEmailTemplate();
            expect(scope.createTemplateEmail).toBeTruthy();
            scope.addTemplateEmail(newTemplate);
            expect(scope.emailOption.emailTemplate.length).toEqual(2);
            expect(scope.createTemplateEmail).toBeFalsy();
        });
    });
});