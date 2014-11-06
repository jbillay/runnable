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
			getDistance: function (source, destination, $scope) {
				$scope.controller = $scope;
				$rootScope.DistanceService = new google.maps.DistanceMatrixService();
				$rootScope.DistanceService.getDistanceMatrix(
					{
						origins: [source],
						destinations: [destination],
						travelMode: google.maps.TravelMode.DRIVING,
						avoidHighways: false,
						avoidTolls: false
					}, function (response, status) {
						if (status === google.maps.DistanceMatrixStatus.OK) {
							$scope.$apply(function () {
								$scope.controller.distance = response.rows[0].elements[0].distance.text;
								$scope.controller.duration = response.rows[0].elements[0].duration.text;
							});
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
    factory('Follow', function ($q, $http) {
        'use strict';
        return {
			addFollow: function (id, type) {
				$http({method: "GET", url: "/follow/add/" + type + '/' + id}).
					success(function (result) {
						console.log('Followed added');
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});

			},
			removeFollow: function (id, type) {
				$http({method: "GET", url: "/follow/remove/" + type + '/' + id}).
					success(function (result) {
						console.log('Followed removed');
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});

			},
			getMyFollow: function () {
				var deferred = $q.defer();
                $http({method: "GET", url: "/follow/me"}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			getMyFollowResume: function () {
				var deferred = $q.defer();
                $http({method: "GET", url: "/follow/me/resume"}).
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
    factory('Join', function ($q, $http) {
        'use strict';
        return {
			addJoin: function (id, nbSpace) {
				var info = {journey_id: id, nb_place: nbSpace};
				$http.post("/join", info).
					success(function (result) {
						console.log('Journey joined');
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
			},
			getListForJourney: function (journey_id) {
				var deferred = $q.defer();
                $http({method: "GET", url: "/join/journey/" + journey_id}).
					success(function (result) {
						console.log('Result : ' + result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			removeJoin: function (id) {
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

