/**
 * Created by jeremy on 04/01/2014.
 */

'use strict';

// Declare app level module which depends on filters, and services

angular.module('runnable', [
    'google-maps'.ns(),
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
    'runnable.filters',
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
            when('/home', {
                templateUrl: 'partials/home',
                controller: 'AppHome'
            }).
            when('/create-run', {
                templateUrl: 'partials/create_run',
                controller: 'AppRun'
            }).
            when('/run', {
                templateUrl: 'partials/list_run',
                controller: 'AppRun'
            }).
            when('/', {
                templateUrl: 'partials/index',
                controller: 'AppIndex'
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });