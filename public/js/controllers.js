/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */

angular.module('runnable.controllers', []).
	controller('RunnableIndexController', function ($scope, $q, $timeout, Run, User, Journey, GoogleMapApi) {
		'use strict';
		$scope.page = 'Index';
		$scope.nbRunItems = 4;
		$scope.nbJourneyItems = 4;
		var runPromise = Run.getNextList($scope.nbRunItems),
			journeyPromise = Journey.getNextList($scope.nbJourneyItems),
			userPromise = User.getUser(),
			all = $q.all([runPromise, journeyPromise, userPromise]);
		all.then(function (res) {
			$scope.listRun = res[0];
			$scope.listJourney = res[1];
			$scope.user = res[2];
			$scope.auth = false;
			if ($scope.user.email) $scope.auth = true;
			$timeout( function() {
				angular.forEach($scope.listJourney, function (journey) {
					var value = 'map_canvas_' + journey.id;
					GoogleMapApi.initMap(value);
					GoogleMapApi.showDirection(value, journey.address_start, journey.Run.address_start);
				});
			});
		});
	}).
	controller('RunnableProfileController', function ($scope, $q, $location, $sce, User) {
		'use strict';
		$scope.page = 'Profile';
		var userPromise = User.getUser(),
			userItraRunPromise = User.getItraRuns(),
			userJourneyPromise = User.getJourney(),
			userJoinPromise = User.getJoin(),
			all = $q.all([userPromise, userItraRunPromise, userJourneyPromise, userJoinPromise]);
		all.then(function (res) {
			$scope.user = res[0];
			$scope.itraRuns = $sce.trustAsHtml(res[1]);
			$scope.userJourney = res[2];
			angular.forEach($scope.userJourney, function (journey) {
				var nb_free_place = journey.nb_space;
				angular.forEach(journey.Joins, function (join) {
					nb_free_place = nb_free_place - join.nb_place
				});
				journey.nb_free_space = nb_free_place;
			});
			$scope.userJoin = res[3];
			$scope.auth = false;
			if ($scope.user.email) {
				$scope.auth = true;
			} else {
				$location.path('/');
			}
		});
	}).
    controller('RunnableNavController', function ($scope, $q, User) {
        'use strict';
        $scope.page = 'Nav';
		var userPromise = User.getUser(),
			all = $q.all([userPromise]);
		all.then(function (res) {
			$scope.user = res[0];
			$scope.auth = false;
			if ($scope.user.email) {
				$scope.auth = true;
			}
		});
		$scope.login = function () {
			angular.element('#loginModal').modal('show');
		};
    }).
	controller('AppRunDetail', function ($scope, $cookies, $q, $routeParams, Run, Journey, GoogleMapApi) {
        'use strict';
        $scope.page = 'Run';
		$scope.runId = $routeParams.runId;
		var runPromise = Run.getDetail($scope.runId),
			journeyPromise = Journey.getListForRun($scope.runId),
            all = $q.all([runPromise, journeyPromise]);
        all.then(function (res) {
			$scope.run = res[0];
			$scope.journeyList = res[1];
			GoogleMapApi.initMap('map_canvas', $scope.run.address_start);
		});
    }).
    controller('AppRun', function ($scope, $q, Run, GoogleMapApi) {
        'use strict';
        $scope.page = 'Run';
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
			GoogleMapApi.initMap('map_canvas');
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
	controller('AppJourneyDetail', function ($scope, $q, $routeParams, Run, Journey, Join, User, GoogleMapApi) {
		'use strict';
		$scope.page = 'Journey';
		$scope.journeyId = $routeParams.journeyId;
		var journeyPromise = Journey.getDetail($scope.journeyId),
			joinPromise = Join.getListForJourney($scope.journeyId),
			userPromise = User.getUser(),
			all = $q.all([journeyPromise, joinPromise, userPromise]);
		all.then(function (res) {
			$scope.journey = res[0];
			$scope.joinList = res[1];
			$scope.user = res[2];
			$scope.joined = 0;
			$scope.reserved = 0;
			angular.forEach($scope.joinList, function (join) {
				$scope.reserved += join.nb_place;
				if (join.JourneyId == $scope.journeyId && join.UserId === $scope.user.id) {
					$scope.joined = 1;
				}
			});
			$scope.nbFreeSpaceList = $scope.getFreeSpace();
			GoogleMapApi.initMap('map_canvas');
			GoogleMapApi.showDirection('map_canvas', $scope.journey.address_start, $scope.journey.run.address_start);
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
	controller('AppJourney', function ($scope, $cookies, $q, $http, Run, Journey, GoogleMapApi) {
        'use strict';
        $scope.page = 'Journey';
		var runPromise = Run.getActiveList(),
			journeyPromise = Journey.getList(),
            all = $q.all([runPromise, journeyPromise]);
        all.then(function (res) {
			$scope.runList = res[0];
			$scope.journeyList = res[1];
			GoogleMapApi.initMap('map_canvas');
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