/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */

angular.module('runnable.controllers', []).
    controller('AppIndex', function ($scope) {
        'use strict';
        $scope.page = 'Index';
    }).
    controller('AppHome', function ($scope, $cookies, Follow) {
        'use strict';
        $scope.page = 'Home';
        $scope.user = angular.fromJson($cookies.user);
    }).
    controller('AppSidebar', function (Follow, $q) {
        'use strict';
		/*
		var followPromise = Follow.getMyFollowResume(),
			all = $q.all([followPromise]);
        all.then(function (res) {
			$scope.followResumeList = res[0];
		});
		*/
    }).
	controller('AppRunDetail', function ($scope, $cookies, $q, $routeParams, Run, Journey, GoogleMapApi, Follow) {
        'use strict';
        $scope.page = 'Run';
        $scope.user = angular.fromJson($cookies.user);
		$scope.runId = $routeParams.runId;
		var runPromise = Run.getDetail($scope.runId),
			journeyPromise = Journey.getListForRun($scope.runId),
			followPromise = Follow.getMyFollow(),
            all = $q.all([runPromise, journeyPromise, followPromise]);
        all.then(function (res) {
			$scope.run = res[0];
			$scope.journeyList = res[1];
			$scope.followList = res[2];
			$scope.followed = 0;
			angular.forEach($scope.followList, function (follow) {
				if (follow.type_id == $scope.runId && follow.type === "run") {
					console.log('Run followed');
					$scope.followed = 1;
				}
			});
			GoogleMapApi.initMap($scope.run.address_start);
		});
		$scope.followRun = function () {
			Follow.addFollow($scope.runId, 'run');
			$scope.followed = 1;
		};
		$scope.removeFollowRun = function () {
			Follow.removeFollow($scope.runId, 'run');
			$scope.followed = 0;
		};
    }).
    controller('AppRun', function ($scope, $cookies, $q, $http, Run, Follow) {
        'use strict';
        $scope.page = 'Run';
        $scope.user = angular.fromJson($cookies.user);
		var runPromise = Run.getActiveList(),
			followPromise = Follow.getMyFollow(),
            all = $q.all([runPromise, followPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
			$scope.followList = res[1];
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
	controller('AppJourneyDetail', function ($scope, $cookies, $q, $routeParams, Run, Journey, GoogleMapApi, Follow) {
		'use strict';
		$scope.page = 'Journey';
		$scope.user = angular.fromJson($cookies.user);
		$scope.journeyId = $routeParams.journeyId;
		var journeyPromise = Journey.getDetail($scope.journeyId),
			followPromise = Follow.getMyFollow(),
			all = $q.all([journeyPromise, followPromise]);
		all.then(function (res) {
			$scope.journey = res[0];
			$scope.followList = res[1];
			$scope.followed = 0;
			angular.forEach($scope.followList, function (follow) {
				if (follow.type_id == $scope.journeyId && follow.type === "journey") {
					console.log('Journey followed');
					$scope.followed = 1;
				}
			});
			console.log($scope.journey.run.name);
			GoogleMapApi.initMap();
			GoogleMapApi.showDirection($scope.journey.address_start, $scope.journey.run.address_start);
		});
		$scope.followJourney = function () {
			Follow.addFollow($scope.journeyId, 'journey');
			$scope.followed = 1;
		}
		$scope.removeFollowJourney = function () {
			Follow.removeFollow($scope.journeyId, 'journey');
			$scope.followed = 0;
		}
	}).
	controller('AppJourney', function ($scope, $cookies, $q, $http, Run, Journey, GoogleMapApi, Follow) {
        'use strict';
        $scope.page = 'Journey';
        $scope.user = angular.fromJson($cookies.user);
		var runPromise = Run.getActiveList(),
			journeyPromise = Journey.getList(),
			followPromise = Follow.getMyFollow(),
            all = $q.all([runPromise, journeyPromise, followPromise]);
        all.then(function (res) {
			$scope.runList = res[0];
			$scope.journeyList = res[1];
			$scope.followList = res[2];
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