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
	factory('AuthService', function ($http, $q, $rootScope, Session, User) {
		var authService = {};
		
		authService.init = function () {
			return User.getUser().then(function (res) {
				Session.create(res);
				return res.data;
			});
		};
		
		authService.reset = function (email) {
			return $http.post('/api/user/password/reset', {email: email});
		};

		authService.login = function (credentials) {
			return $http
				.post('/login', credentials)
				.then(function (res) {
					Session.create(res.data);
					return res.data;
				})
				.catch(function (err) {
					var obj_msg = {
						"msg" : "userAuthFailed",
						"type" : "error" };
					$rootScope.$broadcast('USER_MSG', obj_msg);
					return err;
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
    factory('User', function ($q, $http, $rootScope) {
        'use strict';
		return {
			create: function (user) {
                var deferred = $q.defer();
                $http.post("/api/user", user).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ', data);
						deferred.resolve(data);
					});
				return deferred.promise;
			},
			getUser: function () {
                var deferred = $q.defer();
                $http.get("/api/user/me").
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ', data);
						deferred.resolve(data);
					});
                return deferred.promise;
            },
            getPublicInfo: function (userId) {
                var deferred = $q.defer();
                $http.get("/api/user/public/info/" + userId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ', data);
						deferred.resolve(data);
					});
                return deferred.promise;
            },
			getItraRuns: function (userId) {
				var deferred = $q.defer();
				var url = "/api/user/runs";
				if (userId) {
					url = url + '/' + userId;
				}
				$http.get(url).
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
			getJourneyFreeSpace: function (journey) {
				var ret = {
						nb_free_place_outward: journey.nb_space_outward,
						nb_free_place_return: journey.nb_space_return
					};
				angular.forEach(journey.Joins, function (join) {
					ret.nb_free_place_outward = ret.nb_free_place_outward - join.nb_place_outward;
					ret.nb_free_place_return = ret.nb_free_place_return - join.nb_place_return;
				});
				return ret;
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
			},
			updatePassword: function (passwords) {
				var deferred = $q.defer();
                $http.post("/api/user/password/update", {"passwords": passwords}).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
				return deferred.promise;
			},
			inviteFriends: function (inviteData) {
				var deferred = $q.defer(),
					info = {emails: inviteData.inviteEmails, message: inviteData.inviteMessage};
				$http.post("/api/user/invite", info).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
				return deferred.promise;
			}
		}
    }).
	factory('MyRunTripFees', function () {
		'use strict';
		var feesMap = [
			{timeMin: 259200, 	timeMax: null, 		fixed: 0.66, variable: 7.92},
			{timeMin: 172800, 	timeMax: 259201, 	fixed: 0.95, variable: 10.68},
			{timeMin: 86400, 	timeMax: 172801, 	fixed: 1.07, variable: 11.88},
			{timeMin: null,		timeMax: 86401, 	fixed: 1.19, variable: 12.48}
		];
		return {
			getTimeBeforeStart: function (startDate, startHour) {
				var dateTime = startDate + ' ' + startHour,
					start = Date.parse(dateTime),
					now = Date.now();
				return start - now;
			},
			getFees: function (startDate, startHour, amount) {
				var timeBeforeStart = this.getTimeBeforeStart(startDate, startHour),
					fees = 0;
				angular.forEach(feesMap, function (feesStep) {
					if (timeBeforeStart > feesStep.timeMin || feesStep.timeMin === null) {
						if (timeBeforeStart < feesStep.timeMax || feesStep.timeMax === null) {
							fees = feesStep.fixed + (amount * (feesStep.variable / 100));
						}
					}
				});
				return fees;
			}
		}
	}).
    factory('GoogleMapApi', function ($rootScope, $http, $q) {
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
			},
			resetDirection: function (object) {
				if ($rootScope[object].directionsRenderer) {
					$rootScope[object].directionsRenderer.setMap(null);
				}
			},
			showDirection: function (object, source, destination) {
				var request = {
					origin:source,
					destination:destination,
					travelMode: google.maps.TravelMode.DRIVING
				};
				$rootScope[object].directionsService.route(request, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						$rootScope[object].directionsRenderer = new google.maps.DirectionsRenderer;
						$rootScope[object].directionsRenderer.setMap($rootScope[object].map);
						$rootScope[object].directionsRenderer.setDirections(response);
					}
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
			getDistance: function (source, destination) {
				var deferred = $q.defer();
				$rootScope.DistanceServicePromise = new google.maps.DistanceMatrixService();
				$rootScope.DistanceServicePromise.getDistanceMatrix(
					{
						origins: [source],
						destinations: [destination],
						travelMode: google.maps.TravelMode.DRIVING,
						avoidHighways: false,
						avoidTolls: false
					}, function (response, status) {
						if (status === google.maps.DistanceMatrixStatus.OK) {
							var result = {};
							result.distance = response.rows[0].elements[0].distance.text;
							result.duration = response.rows[0].elements[0].duration.text;
							deferred.resolve(result);
						}
					});
				return deferred.promise;
			}
		};
    }).
    factory('Join', function ($q, $http) {
        'use strict';
        return {
			addJoin: function (id, nbSpaceOutward, nbSpaceReturn) {
				var deferred = $q.defer(),
					info = {journey_id: id, nb_place_outward: nbSpaceOutward, nb_place_return: nbSpaceReturn};
				$http.post("/api/join", info).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ' + status);
					});
				return deferred.promise;
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
	factory('Socket', function (socketFactory) {
		return socketFactory();
	}).
	factory('Discussion', function ($q, $http) {
		'use strict';
		return {
			getUsers: function (journeyId) {
				var deferred = $q.defer();
				$http.get("/api/discussion/users/" + journeyId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ', data);
						deferred.resolve(data);
					});
				return deferred.promise;
			},
			getMessages: function (journeyId) {
				var deferred = $q.defer();
				$http.get("/api/discussion/messages/" + journeyId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ', data);
						deferred.resolve(data);
					});
				return deferred.promise;
			},
			addMessage: function(message, journeyId) {
				var deferred = $q.defer();
				$http.post("/api/discussion/message", {"message": message, "journeyId": journeyId}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						console.log('Error : ', data);
						deferred.resolve(data);
					});
				return deferred.promise;
			}
		};
    }).
    factory('Participate', function ($q, $http, $rootScope) {
        'use strict';
        return {
            add: function (runId) {
                var deferred = $q.defer();
                $http.post("/api/participate/add", {"runId": runId}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function (data, status) {
                        console.log('Error : ' + status);
                        deferred.resolve(data);
                    });
                return deferred.promise;
            }
        }
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

