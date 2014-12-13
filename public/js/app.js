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
    config(function ($routeProvider, $locationProvider, USER_ROLES) {
        $routeProvider.
            when('/login', {
                templateUrl: 'partials/login',
                controller: 'AppLogin'
            }).
            when('/admin', {
                templateUrl: 'partials/admin',
                controller: 'RunnableAdminController',
				data: {
					authorizedRoles: [USER_ROLES.admin]
				}
            }).
            when('/run-create', {
                templateUrl: 'partials/run_create',
                controller: 'RunnableRunController',
				data: {
					authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
				}
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
                controller: 'RunnableProfileController',
				data: {
					authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.user]
				}
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
    }).
	run(function ($rootScope, AUTH_EVENTS, AuthService, $location) {
		$rootScope.$on('$routeChangeStart', function (event, next) {
			AuthService.init().then(function () {
				if (next.data) {
					var authorizedRoles = next.data.authorizedRoles;
					if (!AuthService.isAuthorized(authorizedRoles)) {
						event.preventDefault();
						if (AuthService.isAuthenticated()) {
							// user is not allowed
							console.log(AUTH_EVENTS.notAuthorized);
							$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
						} else {
							// user is not logged in
							console.log(AUTH_EVENTS.notAuthenticated);
							$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
						}
						$location.path('/');
					}
				}
			});
		});
	});