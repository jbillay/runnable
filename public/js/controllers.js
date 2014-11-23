/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */

angular.module('runnable.controllers', []).
    controller('RunnableIndexController', function ($scope, $q, Run, User) {
        'use strict';
        $scope.page = 'Index';
		$scope.nbRunItems = 4;
		$scope.nbJourneyItems = 4;
		var runPromise = Run.getNextList($scope.nbRunItems),
			userPromise = User.getUser(),
			all = $q.all([runPromise, userPromise]);
		all.then(function (res) {
			$scope.listRun = res[0];
			$scope.user = res[1];
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
    controller('AppRun', function ($scope, $cookies, $q, $http, Run) {
        'use strict';
        $scope.page = 'Run';
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
		});
        $scope.getLocation = function(val) {
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: val,
                    sensor: false
                }
            }).then(function(response){
                return response.data.results.map(function(item){
                    return item.formatted_address;
                });
            });
        };
		$scope.initMap = function (address) {
			var mapOptions = {
			  center: { lat: 46.22764, lng: 2.21375},
			  zoom: 5
			};
			$scope.geocoder = new google.maps.Geocoder();
			$scope.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
			if (address) {
				$scope.selectedAddress(address);
			}
		}
		$scope.selectedAddress = function ($item) {
			$scope.geocoder.geocode( { 'address': $item}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					$scope.map.setCenter(results[0].geometry.location);
					if ($scope.marker) {
						$scope.marker.setMap(null); }
					$scope.marker = new google.maps.Marker({
						map: $scope.map,
						position: results[0].geometry.location
					});
					$scope.map.setZoom(8);
				}
			});
		}
    }).
	controller('AppJourneyDetail', function ($scope, $cookies, $q, $routeParams, Run, Journey, Join, GoogleMapApi) {
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
					console.log('Journey joined');
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
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: val,
                    sensor: false
                }
            }).then(function(response){
                return response.data.results.map(function(item){
                    return item.formatted_address;
                });
            });
        };
		$scope.initMap = function () {
			GoogleMapApi.initMap();
		};
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