/**
 * Created by jeremy on 04/01/2014.
 */

'use strict';

// Declare app level module which depends on filters, and services

angular.module('runnable', [
    'ngRoute',
    'ui.ace',
    'ui.grid',
    'ui.grid.edit',
    'textAngular',
    'ngSanitize',
    'ngMessages',
    'ngFacebook',
    'ui.calendar',
    'ui.bootstrap',
    'ngFileUpload',
    'runnable.filters',
    'runnable.constant',
    'runnable.services',
    'runnable.directives',
    'runnable.controllers'
]).
    config(function ($routeProvider, $locationProvider, USER_ROLES, $facebookProvider) {
        $routeProvider.
            when('/connect', {
                templateUrl: 'partials/connect',
                controller: 'RunnableConnectController'
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
            when('/run-update-:runId', {
                templateUrl: 'partials/run_update',
                controller: 'RunnableRunUpdateController',
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
                controller: 'RunnableJourneyCreateController'
            }).
            when('/journey-create-:runId', {
                templateUrl: 'partials/journey_create',
                controller: 'RunnableJourneyCreateController'
            }).
            when('/journey-update-:journeyId', {
                templateUrl: 'partials/journey_update',
                controller: 'RunnableJourneyUpdateController',
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
            when('/myjourney-discussion-:journeyId', {
                templateUrl: 'partials/journey_discussion',
                controller: 'RunnableDiscussionJourneyController'
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
            when('/checkout-:journeyId', {
                templateUrl: 'partials/checkout',
                controller: 'RunnableCheckoutController'
            }).
            when('/', {
                templateUrl: 'partials/index',
                controller: 'RunnableIndexController'
            }).
            when('/page-:tag', {
                templateUrl: 'partials/page',
                controller: 'RunnablePageController'
            }).
            when('/widget-journey-:runId', {
                templateUrl: 'partials/widget_journey',
                controller: 'RunnableWidgetJourneyController'
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $facebookProvider.setAppId('1418340641711854');
        $facebookProvider.setVersion('v2.3');
        moment.locale('fr');
    }).
	run(function ($rootScope, AUTH_EVENTS, AuthService, $location) {
		$rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (next.$$route.originalPath === '/connect') {
                if (current) {
                    var originPath = current.$$route.originalPath;
                    Object.getOwnPropertyNames(current.params).forEach(function(val, idx, array) {
                        originPath = originPath.replace(':' + val, current.params[val]);
                    });
                    $rootScope.referer = {path: originPath};
                }
            }
            if (next.data) {
                AuthService.init()
                    .then(function () {
                        var authorizedRoles = next.data.authorizedRoles;
                        if (!AuthService.isAuthorized(authorizedRoles)) {
                            event.preventDefault();
                            if (AuthService.isAuthenticated()) {
                                // user is not allowed
                                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                                $location.path('/');
                            } else {
                                // user is not logged in
                                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                                $location.path('/connect');
                            }
                        }
                    })
                    .catch(function () {
                        $location.path('/');
                    });
            }
		});
        (function(){
            // If we've already installed the SDK, we're done
            if (document.getElementById('facebook-jssdk')) {return;}

            // Get the first script element, which we'll use to find the parent node
            var firstScriptElement = document.getElementsByTagName('script')[0];

            // Create a new script element and set its id
            var facebookJS = document.createElement('script');
            facebookJS.id = 'facebook-jssdk';

            // Set the new script's source to the source of the Facebook JS SDK
            facebookJS.src = '//connect.facebook.net/en_US/all.js';

            // Insert the Facebook JS SDK into the DOM
            firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
        }());
	});