/**
 * Created by jeremy on 04/01/2014.
 */

'use strict';

// Declare app level module which depends on filters, and services

angular.module('runnable', [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'ui.bootstrap',
    'runnable.filters',
    'runnable.constant',
    'runnable.services',
    'runnable.directives',
    'runnable.controllers'
]).
    config(function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/login', {
                templateUrl: 'partials/login',
                controller: 'AppLogin'
            }).
            when('/admin', {
                templateUrl: 'partials/admin',
                controller: 'RunnableAdminController'
            }).
            when('/run-create', {
                templateUrl: 'partials/run_create',
                controller: 'RunnableRunController'
            }).
            when('/run', {
                templateUrl: 'partials/run_list',
                controller: 'RunnableRunController'
            }).
            when('/run-:runId', {
                templateUrl: 'partials/run_detail',
                controller: 'RunnableRunDetailController'
            }).
            when('/journey-create', {
                templateUrl: 'partials/journey_create',
                controller: 'RunnableJourneyController'
            }).
            when('/journey', {
                templateUrl: 'partials/journey_list',
                controller: 'RunnableJourneyController'
            }).
            when('/journey-:journeyId', {
                templateUrl: 'partials/journey_detail',
                controller: 'RunnableJourneyDetailController'
            }).
            when('/profile', {
                templateUrl: 'partials/profile',
                controller: 'RunnableProfileController'
            }).
            when('/', {
                templateUrl: 'partials/index',
                controller: 'RunnableIndexController'
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });