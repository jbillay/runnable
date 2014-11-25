/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */

angular.module('runnable.controllers', []).
    controller('RunnableIndexController', function ($scope, $q, Run, User, Journey) {
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
			if ($scope.user.email) {
				$scope.auth = true;
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
			GoogleMapApi.initMap($scope.run.address_start);
		});
    }).
    controller('AppRun', function ($scope, $q, Run, GoogleMapApi) {
        'use strict';
        $scope.page = 'Run';
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
			GoogleMapApi.initMap();
		});
        $scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		}
		$scope.selectedAddress = function (address) {
			GoogleMapApi.selectedAddress(address);
		}
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
	controller('AppJourneyDetail', function ($scope, $q, $routeParams, Run, Journey, Join, GoogleMapApi) {
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
				if (join.JourneyId == $scope.journeyId && join.UserId === $scope.user.id) {
					$scope.joined = 1;
				}
			});
			$scope.nbFreeSpaceList = $scope.getFreeSpace();
			GoogleMapApi.initMap();
			GoogleMapApi.showDirection($scope.journey.address_start, $scope.journey.run.address_start);
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
		});
		$scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		}
		$scope.initMap = GoogleMapApi.initMap();
		$scope.showMapInfo = function () {
			GoogleMapApi.showDirection($scope.source, $scope.destination);
			GoogleMapApi.getDistance($scope.source, $scope.destination, $scope);
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