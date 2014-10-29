/**
 * Created by jeremy on 04/01/2014.
 */

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('runnable.services', ['ngResource']).
    factory('UserInfo', function ($resource) {
        'use strict';
        return $resource('/get/user/:id', {id: '@_id.$oid'},
            {'query':  {method: 'GET', isArray: false}});
    }).
    factory('GoogleMapApi', function ($rootScope) {
        'use strict';
		return {
			initMap: function (address) {
				var mapOptions = {
				  center: { lat: 46.22764, lng: 2.21375},
				  zoom: 5
				};
				$rootScope.geocoder = new google.maps.Geocoder();
				$rootScope.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
				if (address) {
					this.selectedAddress(address);
				}
				$rootScope.directionsService = new google.maps.DirectionsService();
				$rootScope.directionsDisplay = new google.maps.DirectionsRenderer();
				$rootScope.directionsDisplay.setMap($rootScope.map);
			},
			selectedAddress: function (address) {
				$rootScope.geocoder.geocode( { 'address': address}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						$rootScope.map.setCenter(results[0].geometry.location);
						if ($rootScope.marker) {
							$rootScope.marker.setMap(null); }
						$rootScope.marker = new google.maps.Marker({
							map: $rootScope.map,
							position: results[0].geometry.location
						});
						$rootScope.map.setZoom(8);
					}
				});
			},
			showDirection: function (source, destination) {
				var request = {
					origin:source,
					destination:destination,
					travelMode: google.maps.TravelMode.DRIVING
				};
				$rootScope.directionsService.route(request, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						$rootScope.directionsDisplay.setDirections(response);
					}
				});
			}
		};
    }).
    factory('Run', function ($q, $http) {
        'use strict';
        return {
			getDetail: function (id) {
				var deferred = $q.defer();
                $http({method: "GET", url: "/run/" + id}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
            getActiveList: function () {
                var deferred = $q.defer();
                $http({method: "GET", url: "/run/list"}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
            }
        };
    }).
    factory('Journey', function ($q, $http) {
        'use strict';
        return {
			getDetail: function (id) {
				var deferred = $q.defer();
                $http({method: "GET", url: "/journey/" + id}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
            getList: function () {
                var deferred = $q.defer();
                $http({method: "GET", url: "/journey/list"}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
            },
            getListForRun: function (id) {
                var deferred = $q.defer();
                $http({method: "GET", url: "/journey/run/" + id}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
            }
        };
    });

