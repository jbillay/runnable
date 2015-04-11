/**
 * Created by jeremy on 04/01/2014.
 */

'use strict';

// Declare app level module which depends on filters, and services

angular.module('runnable', [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'ngMessages',
    'ui.calendar',
    'ui.bootstrap',
    'btford.socket-io',
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
                controller: 'RunnableRunCreateController',
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
                controller: 'RunnableJourneyCreateController',
				data: {
					authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.user]
				}
            }).
            when('/journey-create-:runId', {
                templateUrl: 'partials/journey_create',
                controller: 'RunnableJourneyCreateController',
				data: {
					authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.user]
				}
            }).
            when('/journey', {
                templateUrl: 'partials/journey_list',
                controller: 'RunnableJourneyController'
            }).
            when('/myjourney', {
                templateUrl: 'partials/my_journey',
                controller: 'RunnableMyJourneyController',
                data: {
                    authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.user]
                }
            }).
            when('/journey-:journeyId', {
                templateUrl: 'partials/journey_detail',
                controller: 'RunnableJourneyDetailController'
            }).
            when('/user-:userId', {
                templateUrl: 'partials/public_user_profile',
                controller: 'RunnableUserPublicProfileController'
            }).
            when('/inbox', {
                templateUrl: 'partials/user_inbox',
                controller: 'RunnableUserInboxController',
                data: {
                    authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.user]
                }
            }).
            when('/calendar', {
                templateUrl: 'partials/calendar',
                controller: 'RunnableCalendarController',
                data: {
                    authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.user]
                }
            }).
            when('/invoice', {
                templateUrl: 'partials/invoice',
                controller: 'RunnableInvoiceController',
                data: {
                    authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.user]
                }
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
            when('/page-:tag', {
                templateUrl: 'partials/page',
                controller: 'RunnablePageController'
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