/**
 * Created by jeremy on 04/01/2014.
 */

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('runnable.services', ['ngResource']).
	service('Session', function () {
		this.create = function (user) {
			this.userId = user.id;
			this.userFirstname = user.firstname;
			this.userLastname = user.lastname;
			this.userAddress = user.address;
			this.userEmail = user.email;
			this.userItra = user.itra;
			this.userIsActive = user.isActive;
			this.userRole = user.role;
		};
		this.destroy = function () {
			this.userId = null;
			this.userFirstname = null;
			this.userLastname = null;
			this.userAddress = null;
			this.userEmail = null;
			this.userItra = null;
			this.userIsActive = null;
			this.userRole = null;
		};
		return this;
	}).
	factory('AuthService', function ($http, $q, Session, User) {
		var authService = {};
		
		authService.init = function () {
			return User.getUser().then(function (res) {
				Session.create(res);
				return res.data;
			});
		};
		
		authService.reset = function (email) {
			return $http.post('/api/user/mdp/reset', {email: email});
		};

		authService.login = function (credentials) {
			console.log(credentials);
			return $http
				.post('/login', credentials)
				.then(function (res) {
					Session.create(res.data);
					return res.data;
				});
		};

		authService.isAuthenticated = function () {
			return !!Session.userId;
		};

		authService.isAuthorized = function (authorizedRoles) {
			if (!angular.isArray(authorizedRoles)) {
				authorizedRoles = [authorizedRoles];
			}
			return (authService.isAuthenticated() &&
			authorizedRoles.indexOf(Session.userRole) !== -1);
		};

		return authService;
	}).
    factory('User', function ($q, $http) {
        'use strict';
		return {
			getUser: function () {
                var deferred = $q.defer();
                $http.get("/api/user/me").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
            },
			getItraRuns: function () {
				var deferred = $q.defer();
				$http.get("/api/user/runs").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
				return deferred.promise;
			},
			getJourney: function () {
                var deferred = $q.defer();
                $http.get("/api/user/journeys").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			getJoin: function () {
                var deferred = $q.defer();
                $http.get("/api/user/joins").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			getList: function () {
                var deferred = $q.defer();
                $http.get("/api/admin/users").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			userToggleActive: function (id) {
                var deferred = $q.defer();
                $http.post("/api/admin/user/active", {"id": id}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
				return deferred.promise;
			}
		}
    }).
    factory('GoogleMapApi', function ($rootScope, $http) {
        'use strict';
		return {
			initMap: function (object, address) {
				$rootScope[object] = [];
				var mapOptions = {
				  center: { lat: 46.22764, lng: 2.21375},
				  zoom: 5
				};
				$rootScope[object].geocoder = new google.maps.Geocoder();
				$rootScope[object].map = new google.maps.Map(document.getElementById(object), mapOptions);
				if (address) {
					this.selectedAddress(object, address);
				}
				$rootScope[object].directionsService = new google.maps.DirectionsService();
				$rootScope[object].directionsDisplay = new google.maps.DirectionsRenderer();
				$rootScope[object].directionsDisplay.setMap($rootScope[object].map);
			},
			getLocation: function (val) {
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
			},
			selectedAddress: function (object, address) {
				$rootScope[object].geocoder.geocode( { 'address': address}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						$rootScope[object].map.setCenter(results[0].geometry.location);
						if ($rootScope[object].marker) {
							$rootScope[object].marker.setMap(null); }
						$rootScope[object].marker = new google.maps.Marker({
							map: $rootScope[object].map,
							position: results[0].geometry.location
						});
						$rootScope[object].map.setZoom(8);
					}
				});
			},
			getDistance: function (object, source, destination, $scope) {
				$scope.controller = $scope;
				$rootScope[object].DistanceService = new google.maps.DistanceMatrixService();
				$rootScope[object].DistanceService.getDistanceMatrix(
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
			showDirection: function (object, source, destination) {
				var request = {
					origin:source,
					destination:destination,
					travelMode: google.maps.TravelMode.DRIVING
				};
				$rootScope[object].directionsService.route(request, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						$rootScope[object].directionsDisplay.setDirections(response);
					}
				});
			}
		};
    }).
    factory('Join', function ($q, $http) {
        'use strict';
        return {
			addJoin: function (id, nbSpace) {
				var info = {journey_id: id, nb_place: nbSpace};
				$http.post("/api/join", info).
					success(function (result) {
						console.log('Journey joined');
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
			},
			getListForJourney: function (journey_id) {
				var deferred = $q.defer();
                $http({method: "GET", url: "/api/join/journey/" + journey_id}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			getList: function () {
				var deferred = $q.defer();
				$http.get("/api/admin/joins").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
				return deferred.promise;
			}
        };
    }).
    factory('Run', function ($q, $http) {
        'use strict';
        return {
			getDetail: function (id) {
				var deferred = $q.defer();
                $http({method: "GET", url: "/api/run/" + id}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
            getActiveList: function () {
                var deferred = $q.defer();
                $http({method: "GET", url: "/api/run/list"}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
            },
			getNextList: function (nb) {
				var deferred = $q.defer();
                $http({method: "GET", url: "/api/run/next/" + nb}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			getList: function () {
                var deferred = $q.defer();
                $http.get("/api/admin/runs").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
			toogleActive: function (id) {
                var deferred = $q.defer();
                $http.post("/api/admin/run/active", {"id": id}).
					success(function (result) {
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
                $http({method: "GET", url: "/api/journey/" + id}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			},
            getList: function () {
                var deferred = $q.defer();
                $http({method: "GET", url: "/api/journey/list"}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
					});
                return deferred.promise;
            },
            getListForRun: function (id) {
                var deferred = $q.defer();
                $http({method: "GET", url: "/api/journey/run/" + id}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
            },
			getNextList: function (nb) {
				var deferred = $q.defer();
                $http({method: "GET", url: "/api/journey/next/" + nb}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
                return deferred.promise;
			}
        };
    });

