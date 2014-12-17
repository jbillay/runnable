/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */

angular.module('runnable.controllers', []).
	controller('RunnableMainController', function ($scope, $rootScope, $q, USER_ROLES, AUTH_EVENTS,
												   AuthService, USER_MSG, User, Session) {
		$rootScope.currentUser = null;
		$rootScope.userRoles = USER_ROLES;
		$rootScope.isAuthenticated = false;
		$rootScope.isAdmin = false;
		$rootScope.isAuthorized = AuthService.isAuthorized;

		$scope.setCurrentUser = function (user) {
			Session.create(user);
			$rootScope.isAuthenticated = user.isActive;
			$rootScope.isAdmin = AuthService.isAuthorized([USER_ROLES.admin]);
			$rootScope.currentUser = user;
		};

		var userPromise = User.getUser(),
			all = $q.all([userPromise]);
		all.then(function (res) {
			$scope.setCurrentUser(res[0]);
		});
		$scope.switchLoginToReset = function () {
			$scope.forLogin = false;
			$scope.forReset = true;
		};
		$scope.login = function () {
			$scope.forLogin = true;
			$scope.forReset = false;
			angular.element('#loginModal').modal('show');
		};
		
		$rootScope.$on('USER_MSG', function (event, msg) {
			var obj_msg = angular.fromJson(msg);
			var text = USER_MSG[obj_msg.msg];
			if (!text) {
				text = obj_msg.msg; }
			noty({
					layout: 'top',
					theme: 'defaultTheme',
					type: obj_msg.type,
					text: text, // can be html or string
					dismissQueue: true, // If you want to use queue feature set this true
					template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
					animation: {
						open: {height: 'toggle'},
						close: {height: 'toggle'},
						easing: 'swing',
						speed: 500 // opening & closing animation speed
					},
					timeout: 5000, // delay for closing event. Set false for sticky notifications
					maxVisible: 5, // you can set max visible notification for dismissQueue true option,
					killer: false, // for close all notifications before show
					closeWith: ['click'] // ['click', 'button', 'hover']
				});
		});
	}).
	controller('RunnableLoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
		$scope.credentials = {
			username: '',
			password: ''
		};
		$scope.login = function (credentials) {
			AuthService.login(credentials).then(function (user) {
				$scope.setCurrentUser(user);
				$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			}, function () {
				$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
			});
			angular.element('#loginModal').modal('hide');
		};
		$scope.reset = function (email) {
			AuthService.reset(email);
			angular.element('#loginModal').modal('hide');
		};
	}).
	controller('RunnableIndexController', function ($scope, $q, $timeout, Run, User, Journey, GoogleMapApi) {
		'use strict';
		$scope.page = 'Index';
		$scope.nbRunItems = 4;
		$scope.nbJourneyItems = 4;
		var runPromise = Run.getNextList($scope.nbRunItems),
			journeyPromise = Journey.getNextList($scope.nbJourneyItems),
			all = $q.all([runPromise, journeyPromise]);
		all.then(function (res) {
			$scope.listRun = res[0];
			$scope.listJourney = res[1];
			//timeout in order to wait the page to be loaded
			$timeout( function() {
				angular.forEach($scope.listJourney, function (journey) {
					var value = 'map_canvas_' + journey.id;
					GoogleMapApi.initMap(value);
					GoogleMapApi.showDirection(value, journey.address_start, journey.Run.address_start);
				});
			});
		});
	}).
	controller('RunnableProfileController', function ($scope, $q, $rootScope, $location, $sce, User) {
		'use strict';
		$scope.page = 'Profile';
		var userItraRunPromise = User.getItraRuns(),
			userJourneyPromise = User.getJourney(),
			userJoinPromise = User.getJoin(),
			all = $q.all([userItraRunPromise, userJourneyPromise, userJoinPromise]);
		all.then(function (res) {
			$scope.itraRuns = $sce.trustAsHtml(res[0]);
			$scope.userJourney = res[1];
			$scope.userJoin = res[2];
			$scope.passwords = {};
			if (!$rootScope.isAuthenticated) {
				$location.path('/');
			}
			angular.forEach($scope.userJourney, function (journey) {
				var nb_free_place = journey.nb_space;
				angular.forEach(journey.Joins, function (join) {
					nb_free_place = nb_free_place - join.nb_place
				});
				journey.nb_free_space = nb_free_place;
			});
			$scope.userJoin = res[3];
		});
		$scope.updatePassword = function (passwords, form) {
			if (form) {
				form.$setPristine();
				form.$setUntouched();
			}
			User.updatePassword(passwords);
			$scope.passwords = {};
		};
		$scope.updateUserInfo = function (userInfo) {
			console.log('TO BE IMPLEMENTED : Update user info');
		};
	}).
	controller('RunnableAdminController', function ($scope, $q, $rootScope, $location, AuthService, User, Run, Journey, Join) {
		'use strict';
		$scope.page = 'Admin';
		var userListPromise = User.getList(),
			runListPromise = Run.getList(),
			journeyListPromise = Journey.getList(),
			joinListPromise = Join.getList(),
			all = $q.all([userListPromise, runListPromise, journeyListPromise, joinListPromise]);
		all.then(function (res) {
			$scope.userList = res[0];
			$scope.runList = res[1];
			$scope.journeyList = res[2];
			$scope.joinList = res[3];
		});
		$scope.userToggleActive = function(user) {
			console.log('Toggle active for user : ' + user.id);
			User.userToggleActive(user.id);
			if (user.isActive) {
				user.isActive = false;
			} else {
				user.isActive = true;
			}
		};
		$scope.userEdit = function (user) {
			console.log('Edit user ' + user.id);
			$scope.userEdited = user;
			angular.element('#userEditModal').modal('show');
		};
		$scope.userSave = function (user) {
			console.log('Save edited user ' + user.firstname);
			angular.element('#userEditModal').modal('hide');
			$scope.userEdited = null;
		}
		$scope.userResetPassword = function (user) {
			AuthService.reset(user.email);
		};
		$scope.userTrash = function (user) {
			console.log('Trash the user ' + user.id);
		};
		$scope.runToggleActive = function(run) {
			console.log('Toggle active for run : ' + run.id);
			Run.toogleActive(run.id);
			if (run.is_active) {
				run.is_active = false;
			} else {
				run.is_active = true;
			}
		};
	}).
	controller('RunnableRunDetailController', function ($scope, $cookies, $q, $timeout, $routeParams, Run, Journey, GoogleMapApi) {
        'use strict';
        $scope.page = 'Run';
		$scope.runId = $routeParams.runId;
		var runPromise = Run.getDetail($scope.runId),
			journeyPromise = Journey.getListForRun($scope.runId),
            all = $q.all([runPromise, journeyPromise]);
        all.then(function (res) {
			$scope.run = res[0];
			$scope.journeyList = res[1];
			$timeout( function() {
				GoogleMapApi.initMap('map_canvas_run', $scope.run.address_start);
				GoogleMapApi.initMap('map_canvas_journey', $scope.run.address_start);
			});
		});
    }).
    controller('RunnableRunController', function ($scope, $q, $timeout, Run, GoogleMapApi) {
        'use strict';
        $scope.page = 'Run';
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
			$timeout( function() {
				GoogleMapApi.initMap('map_canvas');
			});
		});
        $scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
		$scope.selectedAddress = function (address) {
			GoogleMapApi.selectedAddress('map_canvas', address);
		};
		$scope.today = function() {
			$scope.dt = new Date();
		};
		$scope.clear = function () {
			$scope.dt = null;
		};
		$scope.toggleMin = function() {
			$scope.minDate = $scope.minDate ? null : new Date();
		};
		$scope.toggleMin();
		$scope.openCal = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.calOpened = true;
		};
		$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		$scope.calFormat = 'dd/MM/yyyy';
    }).
	controller('RunnableJourneyDetailController', function ($scope, $q, $routeParams, $rootScope, $timeout, Run, Journey, Join, GoogleMapApi) {
		'use strict';
		$scope.page = 'Journey';
		$scope.journeyId = $routeParams.journeyId;
		var journeyPromise = Journey.getDetail($scope.journeyId),
			joinPromise = Join.getListForJourney($scope.journeyId),
			all = $q.all([journeyPromise, joinPromise]);
		all.then(function (res) {
			$scope.journey = res[0];
			$scope.joinList = res[1];
			$scope.joined = 0;
			$scope.reserved = 0;
			angular.forEach($scope.joinList, function (join) {
				$scope.reserved += join.nb_place;
				if (join.JourneyId == $scope.journeyId && join.UserId === $rootScope.currentUser.id) {
					$scope.joined = 1;
				}
			});
			$scope.nbFreeSpaceList = $scope.getFreeSpace();
			$timeout( function() {
				GoogleMapApi.initMap('map_canvas');
				GoogleMapApi.showDirection('map_canvas', $scope.journey.address_start, $scope.journey.run.address_start);
			});
			$scope.nbFreeSpace = function () {
				return parseInt($scope.journey.nb_space) - parseInt($scope.reserved);
			}
		});
		$scope.getFreeSpace = function() {
			var result = [],
				start = 1,
				end = parseInt($scope.journey.nb_space) - parseInt($scope.reserved);
			for (var i = start; i <= end; i++) {
				result.push(i);
			}
			return result;
		};
		$scope.showJoinForm = function () {
			angular.element('#clientModal').modal('show');
		};
		$scope.joinJourney = function () {
			$scope.joined = 1;
			$scope.reserved = $scope.reserved + $scope.place;
			console.log('Reservation pour ' + $scope.place);
			Join.addJoin($scope.journeyId, $scope.place);
		};
		$scope.removeJoinJourney = function () {
			$scope.joined = 0;
		};
	}).
	controller('RunnableJourneyController', function ($scope, $cookies, $q, $http, $timeout, Run, Journey, GoogleMapApi) {
        'use strict';
        $scope.page = 'Journey';
		var runPromise = Run.getActiveList(),
			journeyPromise = Journey.getList(),
            all = $q.all([runPromise, journeyPromise]);
        all.then(function (res) {
			$scope.runList = res[0];
			$scope.journeyList = res[1];
			$timeout( function() {
				angular.forEach($scope.journeyList, function (journey) {
					var value = 'map_canvas_' + journey.id;
					GoogleMapApi.initMap(value);
					GoogleMapApi.showDirection(value, journey.address_start, journey.Run.address_start);
				});
			});
		});
		$scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
		$scope.showMapInfo = function () {
			GoogleMapApi.showDirection('map_canvas', $scope.source, $scope.destination);
			GoogleMapApi.getDistance('map_canvas', $scope.source, $scope.destination, $scope);
		};
		$scope.selectDestination = function (run) {
			$scope.destination = run.address_start;
			if ($scope.source) {
				$scope.showMapInfo();
			}
		};
		$scope.selectSource = function (address) {
			$scope.source = address;
			if ($scope.destination) {
				$scope.showMapInfo();
			}
		}
	});