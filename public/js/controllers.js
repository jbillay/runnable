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
    controller('AppHome', function ($scope, $cookies) {
        'use strict';
        $scope.page = 'Home';
        $scope.user = angular.fromJson($cookies.user);
    }).
    controller('AppRunDetail', function ($scope, $cookies, $q, $routeParams, Run, Journey, GoogleMapApi) {
        'use strict';
        $scope.page = 'Run';
        $scope.user = angular.fromJson($cookies.user);
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
        $scope.user = angular.fromJson($cookies.user);
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
	controller('AppJourney', function ($scope, $cookies, $q, $http, Run, Journey, GoogleMapApi) {
        'use strict';
        $scope.page = 'Journey';
        $scope.user = angular.fromJson($cookies.user);
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
		}
		$scope.selectDestination = function (run) {
			$scope.destination = run.address_start;
		}
		$scope.selectSource = function (address) {
			$scope.source = address;
			GoogleMapApi.showDirection($scope.source, $scope.destination);
		}
	});