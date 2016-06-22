/**
 * Created by jeremy on 04/01/2014.
 */

/* Services */

'use strict';

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
			this.userRole = user.role;
		};
		this.destroy = function () {
			this.userId = null;
			this.userFirstname = null;
			this.userLastname = null;
			this.userAddress = null;
			this.userEmail = null;
			this.userRole = null;
		};
		return this;
	}).
    factory('Technical', function ($http, $q) {
        return {
            version: function () {
                var deferred = $q.defer();
                $http.get('/api/version').
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    }).
	factory('AuthService', function ($http, $q, $rootScope, Session, User) {
        return {
            init: function () {
                return User.getUser().then(function (res) {
                    Session.create(res);
                    return res;
                });
            },
            reset: function (email) {
                var deferred = $q.defer();
                $http.post('/api/user/password/reset', {email: email}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function (data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            login: function (credentials) {
                var deferred = $q.defer();
                $http.post('/login', credentials).
                    success(function (result) {
                        if (result.type === 'error') {
                            $rootScope.$broadcast('USER_MSG', result);
                        } else {
                            Session.create(result.msg);
                        }
                        deferred.resolve(result.msg);
                    }).
                    error(function (data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            logout: function () {
                var deferred = $q.defer();
                $http.get('/logout').
                    success(function (result) {
                        Session.destroy();
                        deferred.resolve(result.msg);
                    }).
                    error(function (data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            isAuthenticated: function () {
                return !!Session.userId;
            },
            isAuthorized: function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }
                return (!!Session.userId &&
                    authorizedRoles.indexOf(Session.userRole) !== -1);
            }
        };
	}).
    factory('BankAccount', function ($q, $http, $rootScope) {
		return {
			save: function (account) {
                var deferred = $q.defer();
                $http.post('/api/user/bankaccount', account).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			get: function () {
                var deferred = $q.defer();
                $http.get('/api/user/bankaccount').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
			getByUser: function (id) {
				var deferred = $q.defer();
				$http.get('/api/admin/user/bankaccount/' + id).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			}
		};
	}).
    factory('EmailOptions', function ($q, $http, $rootScope) {
		return {
			save: function (options) {
                var deferred = $q.defer();
                $http.post('/api/admin/options', options).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			get: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/options').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            }
		};
	}).
    factory('User', function ($q, $http, $rootScope, Session) {
		return {
			create: function (user) {
                var deferred = $q.defer();
                $http.post('/api/user', user).
					success(function (result) {
                        if (result.type === 'error') {
                            $rootScope.$broadcast('USER_MSG', result.msg);
                            deferred.reject('error ' + result.msg);
                        } else {
                            Session.create(result.msg);
                            deferred.resolve(result.msg);
                        }
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			update: function (user) {
                var deferred = $q.defer();
                $http.put('/api/user', user).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
            delete: function (userId) {
                var deferred = $q.defer();
                $http.post('/api/admin/user/remove', {id: userId}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            getUser: function () {
                var deferred = $q.defer();
                $http.get('/api/user/me').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
            getPublicInfo: function (userId) {
                var deferred = $q.defer();
                $http.get('/api/user/public/info/' + userId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
            getPublicDriverInfo: function (userId) {
                var deferred = $q.defer();
                $http.get('/api/user/public/driver/' + userId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
			getItraRuns: function () {
				var deferred = $q.defer();
				$http.get('/api/user/runs').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			getJourney: function () {
                var deferred = $q.defer();
                $http.get('/api/user/journeys').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
			getJourneyFreeSpace: function (journey) {
                var deferred = $q.defer();
				var ret = {
						nb_free_place_outward: journey.nb_space_outward,
						nb_free_place_return: journey.nb_space_return
					};
                $http.get('/api/journey/book/' + journey.id).
                    success(function (result) {
                        ret.nb_free_place_outward -= result.outward;
                        ret.nb_free_place_return -= result.return;
                        deferred.resolve(ret);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
			},
			getJoin: function () {
                var deferred = $q.defer();
                $http.get('/api/user/joins').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
			getList: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/users').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
			userToggleActive: function (id) {
                var deferred = $q.defer();
                $http.post('/api/admin/user/active', {id: id}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			updatePassword: function (passwords) {
				var deferred = $q.defer();
                $http.post('/api/user/password/update', {passwords: passwords}).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			inviteFriends: function (inviteData) {
				var deferred = $q.defer(),
					info = {emails: inviteData.inviteEmails, message: inviteData.inviteMessage};
				$http.post('/api/user/invite', info).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
            uploadPicture: function (file) {
                var deferred = $q.defer();
                var fd = new FormData();
                fd.append('file', file);
                $http.post('/api/user/picture', fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': 'multipart/form-data'}
                }).
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function (data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    }).
	factory('MyRunTripFees', function ($rootScope, $http, $q) {
		var feesMap = [
			{timeMin: 259200, 	timeMax: null, 		fixed: 1, variable: 12},
			{timeMin: 172800, 	timeMax: 259201, 	fixed: 1, variable: 12},
			{timeMin: 86400, 	timeMax: 172801, 	fixed: 1, variable: 12},
			{timeMin: null,		timeMax: 86401, 	fixed: 1, variable: 12}
		],
            applicableFees = null;
		return {
			getTimeBeforeStart: function (startDate, startHour) {
				var dateTime = startDate + 'T' + startHour + ':00.000Z',
                    start = Date.parse(dateTime),
					dateNow = new Date(),
                    offset = dateNow.getTimezoneOffset() * 60000;
                start += offset;
                var value = start - dateNow.getTime();
				return value/1000;
			},
			getFees: function (startDate, startHour, amount) {
                var year = startDate.substr(0, 4),
                    month = startDate.substr(5, 2),
                    day = startDate.substr(8, 2),
                    localStartDate = year + '-' + month + '-' + day,
                    timeBeforeStart = this.getTimeBeforeStart(localStartDate, startHour),
					fees = 0;
				angular.forEach(feesMap, function (feesStep) {
					if (timeBeforeStart > feesStep.timeMin || feesStep.timeMin === null) {
						if (timeBeforeStart < feesStep.timeMax || feesStep.timeMax === null) {
							fees = feesStep.fixed + (amount * (feesStep.variable / 100));
						}
					}
				});
				return Number((fees).toFixed(2));
			},
            calculateFee: function (amount, discount) {
                var fees = _.toNumber(applicableFees.value) + (_.toNumber(amount) * _.toNumber(applicableFees.percentage)) || 0;
                if (discount || discount === 0) {
                    fees = fees - (fees * _.toNumber(discount / 100));
                } else if (applicableFees.discount) {
                    fees = fees - (fees * _.toNumber(applicableFees.discount));
                }
                return _.toNumber((fees).toFixed(2));
            },
            getFee: function (journeyId) {
                var deferred = $q.defer(),
                    fees = {
                        percentage: 0.12,
                        value: 1,
                        discount: 0
                    };

                $http.get('/api/fee/' + journeyId)
                    .success(function (result) {
                        if (result.type === 'error') {
                            applicableFees = fees;
                            deferred.resolve(fees);
                        } else {
                            applicableFees = result.msg;
                            deferred.resolve(result.msg);
                        }
                    })
                    .error(function (err) {
                        // WARNING: Temporary fallback with figures set as 12% and 1 €
                        applicableFees = fees;
                        deferred.resolve(fees);
                    });
                return deferred.promise;
            },
            getDefault: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/default/fee').
                    success(function (result) {
                        if (result.type === 'error') {
                            deferred.reject('error ' + result.msg);
                        } else {
                            deferred.resolve(result.msg);
                        }
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            update: function (values) {
                var deferred = $q.defer(),
                    newValues = {
                        id: null,
                        code: null,
                        percentage: null,
                        value: null,
                        discount: null,
                        default: false,
                        remaining: null,
                        start_date: null,
                        end_date: null,
                        RunId: null,
                        UserId: null
                    };
                newValues = _.assign(newValues, values);
                $http.put('/api/admin/fee', {fee: newValues}).
                    success(function (result) {
                        if (result.type === 'error') {
                            deferred.reject('error ' + result.msg);
                        } else {
                            $rootScope.$broadcast('USER_MSG', {msg: 'defaultFeeUpdated', type: 'success'});
                            deferred.resolve(result.msg);
                        }
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            create: function (values) {
                var deferred = $q.defer(),
                    newValues = {
                        id: null,
                        code: null,
                        percentage: null,
                        value: null,
                        discount: null,
                        default: false,
                        remaining: null,
                        start_date: null,
                        end_date: null,
                        RunId: null,
                        UserId: null
                    };
                newValues = _.assign(newValues, values);
                $http.post('/api/admin/fee', {fee: newValues}).
                    success(function (result) {
                        if (result.type === 'error') {
                            deferred.reject('error ' + result.msg);
                        } else {
                            $rootScope.$broadcast('USER_MSG', {msg: 'feeCreated', type: 'success'});
                            deferred.resolve(result.msg);
                        }
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            checkCode: function (code) {
                var deferred = $q.defer();

                $http.get('/api/fee/check/' + code)
                    .success(function (result) {
                        if (result.type === 'error') {
                            deferred.reject('error ' + result.msg);
                        } else {
                            deferred.resolve(result.msg);
                        }
                    })
                    .error(function (data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            getFeeList: function () {
                var deferred = $q.defer(),
                    fees = {
                        fees: [],
                        code: []
                    };
                $http.get('/api/admin/fees').
                    success(function (result) {
                        if (result.type === 'error') {
                            deferred.reject('error ' + result.msg);
                        } else {
                            result.msg.forEach(function (fee) {
                                if (fee.code === null) {
                                    fees.fees.push(fee);
                                } else {
                                    fees.code.push(fee);
                                }
                            });
                            deferred.resolve(fees);
                        }
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
		};
	}).
    factory('GoogleMapApi', function ($rootScope, $http, $q) {
		return {
			initMap: function (object, address) {
				$rootScope[object] = [];
                $rootScope[object].marker = $rootScope[object].infoWindow = [];
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
                $rootScope[object].directionsRenderer = new google.maps.DirectionsRenderer();
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
					if (status === google.maps.DirectionsStatus.OK) {
						$rootScope[object].directionsRenderer.setMap($rootScope[object].map);
						$rootScope[object].directionsRenderer.setDirections(response);
					}
				});
			},
			selectedAddress: function (object, address) {
				$rootScope[object].geocoder.geocode( { 'address': address}, function(results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						$rootScope[object].map.setCenter(results[0].geometry.location);
						if ($rootScope[object].marker && $rootScope[object].marker.length) {
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
				return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
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
			},
            getGeocode: function (address, lat, lng) {
                var deferred = $q.defer();
                if (lat && lng) {
                    deferred.resolve({lat: parseFloat(lat), lng: parseFloat(lng)});
                } else {
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode( { 'address': address}, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            deferred.resolve(results[0].geometry.location);
                        } else {
                            deferred.reject('Err: ' + status + ' for address ' + address);
                        }
                    });
                }
                return deferred.promise;
            },
            addMaker: function (object, address, lat, lng, title, info, image) {
                var deferred = $q.defer();
                this.getGeocode(address, lat, lng)
                    .then(function (location) {
                        var markerIdx = null;
                        if (title) {
                            var infoWindowIdx = $rootScope[object].infoWindow.push(new google.maps.InfoWindow({
                                    content: info
                                })) - 1;
                            markerIdx = $rootScope[object].marker.push(new google.maps.Marker({
                                    map: $rootScope[object].map,
                                    position: location,
                                    draggable: false,
                                    animation: google.maps.Animation.DROP,
                                    title: title,
                                    icon: image
                                })) - 1;
                            $rootScope[object].marker[markerIdx].addListener('click', function() {
                                $rootScope[object].infoWindow[infoWindowIdx].open($rootScope[object].map, $rootScope[object].marker[markerIdx]);
                                deferred.resolve(markerIdx);
                            });
                        } else {
                            markerIdx = $rootScope[object].marker.push(new google.maps.Marker({
                                    map: $rootScope[object].map,
                                    draggable: false,
                                    animation: google.maps.Animation.DROP,
                                    position: location,
                                    icon: image
                                })) - 1;
                            deferred.resolve(markerIdx);
                        }
                    });
                return deferred.promise;
            },
            toggleAnimation: function (object, id, animation, image_back, image_front) {
                if (animation === 'BOUNCE') {
                    animation = google.maps.Animation.BOUNCE;
                }
                if ($rootScope[object].marker[id].getAnimation() !== null) {
                    $rootScope[object].marker[id].setAnimation(null);
                    $rootScope[object].marker[id].setIcon(image_back);
                } else {
                    $rootScope[object].marker[id].setAnimation(animation);
                    $rootScope[object].marker[id].setIcon(image_front);
                }

            },
            refresh: function (object) {
                var center = $rootScope[object].map.getCenter();
                google.maps.event.trigger($rootScope[object].map, 'resize');
                $rootScope[object].map.setCenter(center);
            }
		};
    }).
    factory('Join', function ($q, $http, $rootScope) {
        return {
			add: function (id, nbSpaceOutward, nbSpaceReturn, amount, fees, ref) {
				var deferred = $q.defer(),
					info = {
						journey_id: id,
						nb_place_outward: nbSpaceOutward,
						nb_place_return: nbSpaceReturn,
						amount: amount,
						fees: fees,
						status: 'pending',
						ref: ref };
				$http.post('/api/join', info).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			getListForJourney: function (journey_id) {
				var deferred = $q.defer();
                $http.get('/api/join/journey/' + journey_id).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
			getList: function () {
				var deferred = $q.defer();
				$http.get('/api/admin/joins').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			cancel: function (id) {
				var deferred = $q.defer();
				$http.get('/api/join/cancel/' + id).
					success(function (result) {
						$rootScope.$broadcast('USER_MSG', result);
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
            toRefund: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/join/toRefund').
                    success(function (result) {
                        if (result.type === 'success') {
                            deferred.resolve(result.msg);
                        } else  {
                            deferred.reject(result.msg);
                        }
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            refund: function (id) {
                var deferred = $q.defer();
                $http.post('/api/admin/join/refund', {id: id}).
                    success(function (result) {
                        if (result.type === 'success') {
                            deferred.resolve(result.msg);
                        } else  {
                            deferred.reject(result.msg);
                        }
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    }).
    factory('Run', function ($q, $http, $rootScope) {
        return {
            create: function (run) {
                var deferred = $q.defer();
                $http.post('/api/run', run, {
                    transformRequest: [],
                    headers: {'Content-Type': undefined}
                }).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            update: function (run) {
                var deferred = $q.defer();
                $http.put('/api/run', {run: run}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
			getDetail: function (id) {
				var deferred = $q.defer();
                $http.get('/api/run/' + id).
					success(function (result) {
                        deferred.resolve(result);
                    }).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
            getActiveList: function () {
                var deferred = $q.defer();
                $http.get('/api/run/list').
					success(function (result) {
                        if (result.type === 'success') {
                            deferred.resolve(result.msg);
                        } else  {
                            deferred.reject('error : ' + result.msg);
                        }
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
			getNextList: function (nb) {
				var deferred = $q.defer();
                $http.get('/api/run/next/' + nb).
					success(function (result) {
                        if (result.type === 'success') {
                            deferred.resolve(result.msg);
                        } else  {
                            deferred.reject('error : ' + result.msg);
                        }
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
			getList: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/runs').
					success(function (result) {
                        if (result.type === 'success') {
                            deferred.resolve(result.msg);
                        } else  {
                            deferred.reject('error : ' + result.msg);
                        }
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
            toggleActive: function (id) {
                var deferred = $q.defer();
                $http.post('/api/admin/run/active', {id: id}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
            search: function (searchInfo) {
                var deferred = $q.defer();
                $http.post('/api/run/search', searchInfo).
                    success(function (result) {
                        if (result.type === 'success') {
                            deferred.resolve(result.msg);
                        } else  {
                            deferred.reject('error : ' + result.msg);
                        }
                    }).
                    error(function (data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
	}).
    factory('ValidationJourney', function ($q, $http, $rootScope) {
        return {
            validation: function (joinId, commentDriver, commentService, rate_driver, rate_service) {
                var deferred = $q.defer(),
                    info = {joinId: joinId, commentDriver: commentDriver,
                        commentService: commentService, rate_driver: rate_driver,
                        rate_service: rate_service};
                $http.post('/api/validation', info).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            userFeedback: function () {
                var deferred = $q.defer();
                $http.get('/api/home/feedback').
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    }).
    factory('Email', function ($q, $http, $rootScope) {
        return {
            send: function (data) {
                var deferred = $q.defer(),
                    info = {emails: data.emails, message: data.message, title: data.title, confirm: data.confirm};
                $http.post('/api/send/mail', info).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    }).
	factory('Invoice', function ($q, $http) {
        return {
            getByUser: function() {
                var deferred = $q.defer();
                $http.get('/api/invoice').
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            getByDriver: function() {
                var deferred = $q.defer();
                $http.get('/api/invoice/driver').
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            complete: function (amount, invoiceRef) {
                var deferred = $q.defer(),
                    data = {
                        amount: amount,
                        payment_status: 'completed',
                        txn_id: 'TOBECOMPLETEMANUALY',
                        invoice: invoiceRef
                    };
                $http.post('/api/admin/invoice/complete', data).
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    }).
	factory('Page', function ($q, $http, $rootScope) {
        return {
            getByTag: function (tag) {
                var deferred = $q.defer();
                $http.get('/api/page/' + tag).
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            getList: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/pages').
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
			save: function (newPage) {
				var deferred = $q.defer();
                $http.post('/api/admin/page', newPage).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
			}
        };
    }).
	factory('Partner', function ($q, $http, $rootScope) {
        return {
            getByToken: function (token) {
                var deferred = $q.defer();
                $http.get('/api/admin/partner/' + token).
                    success(function (result) {
                        if(result.type === 'error') {
                            deferred.reject('error : ' + result.msg);
                        } else {
                            deferred.resolve(result.msg);
                        }
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            getList: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/partners').
                    success(function (result) {
                        if(result.type === 'error') {
                            deferred.reject('error : ' + result.msg);
                        } else {
                            deferred.resolve(result.msg);
                        }
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
			create: function (newPartner) {
				var deferred = $q.defer();
                $http.post('/api/admin/partner', {partner: newPartner}).
                    success(function (result) {
                        if(result.type === 'error') {
                            deferred.reject('error : ' + result.msg);
                        } else {
                            $rootScope.$broadcast('USER_MSG', {msg: 'partnerCreated', type: result.type});
                            deferred.resolve(result.msg);
                        }
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
			},
			sendInfo: function (partnerId) {
				var deferred = $q.defer();
                $http.post('/api/admin/partner/info', {partner: {id: partnerId}}).
                    success(function (result) {
                        if(result.type === 'error') {
                            deferred.reject('error : ' + result.msg);
                        } else {
                            $rootScope.$broadcast('USER_MSG', {msg: 'partnerInfoSent', type: result.type});
                            deferred.resolve(result.msg);
                        }
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
			}
        };
    }).
	factory('Inbox', function ($q, $http) {
		return {
			addMessage: function (template, values, userId) {
				var deferred = $q.defer(),
					info = {template: template, values: values, userId: userId};
				$http.post('/api/inbox/msg', info).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			getList: function() {
				var deferred = $q.defer();
				$http.get('/api/inbox/msg').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			getMessage: function(id) {
				var deferred = $q.defer();
				$http.get('/api/inbox/msg/' + id).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			setAsRead: function (id) {
				var deferred = $q.defer(),
					info = {messageId: id};
				$http.post('/api/inbox/msg/read', info).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			deleteMessage: function (id) {
                var deferred = $q.defer(),
                    info = {messageId: id};
                $http.post('/api/inbox/msg/delete', info).
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
			},
			nbUnreadMessage: function () {
				var deferred = $q.defer();
				$http.get('/api/inbox/unread/nb/msg').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			}
		};
	}).
	factory('Discussion', function ($q, $http) {
		return {
			getUsers: function (journeyId) {
				var deferred = $q.defer();
				$http.get('/api/discussion/users/' + journeyId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			getPublicMessages: function (journeyId) {
				var deferred = $q.defer();
				$http.get('/api/discussion/public/messages/' + journeyId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			getPrivateMessages: function (journeyId) {
				var deferred = $q.defer();
				$http.get('/api/discussion/private/messages/' + journeyId).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			addPrivateMessage: function(message, journeyId) {
				var deferred = $q.defer();
				$http.post('/api/discussion/private/message', {message: message, journeyId: journeyId}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			},
			addPublicMessage: function(message, journeyId, email) {
				var deferred = $q.defer();
				$http.post('/api/discussion/public/message', {message: message, journeyId: journeyId, email: email}).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
				return deferred.promise;
			}
		};
    }).
    factory('Participate', function ($q, $http, $rootScope) {
        return {
            add: function (runId) {
                var deferred = $q.defer();
                $http.post('/api/participate/add', {runId: runId}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function (data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            userList: function () {
                var deferred = $q.defer();
                $http.get('/api/participate/user/list').
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function (data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
			userRunList: function (runId) {
                var deferred = $q.defer();
                $http.get('/api/participate/run/user/list/' + runId).
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function (data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    }).
    factory('fileReader', function ($q, $http, $rootScope) {
        var onLoad = function(reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        };
        var onError = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        };
        var getReader = function(deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            return reader;
        };
        var readAsDataURL = function (file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };
        var deletePicture = function () {
            var deferred = $q.defer();
            $http.get('/api/user/remove/picture').
                success(function (result) {
                    $rootScope.$broadcast('USER_MSG', result);
                    deferred.resolve(result);
                }).
                error(function(data, status) {
					deferred.reject('error ' + status + ' : ' + data);
                });
            return deferred.promise;
        };
        return {
            readAsDataUrl: readAsDataURL,
            deletePicture: deletePicture
        };
    }).
    factory('Journey', function ($q, $http, $rootScope) {
        return {
			getDetail: function (id) {
				var deferred = $q.defer();
                $http.get('/api/journey/' + id).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
            getOpenList: function () {
                var deferred = $q.defer();
                $http.get('/api/journey/open').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
            getList: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/journeys').
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
            toPay: function () {
                var deferred = $q.defer();
                $http.get('/api/admin/journey/toPay').
					success(function (result) {
                        if(result.type === 'error') {
                            deferred.reject('error : ' + result.msg);
                        } else {
                            deferred.resolve(result.msg);
                        }
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
            getListForRun: function (id) {
                var deferred = $q.defer();
                $http.get('/api/journey/run/' + id).
					success(function (journeys) {
                        // Remove reserved spaces
                        journeys.forEach(function (journey) {
                            if (journey.Joins) {
                                journey.Joins.forEach(function (join) {
                                    if (join.Invoice && join.Invoice.status === 'completed') {
                                        if (join.nb_place_outward > 0) {
                                            journey.nb_space_outward = journey.nb_space_outward - join.nb_place_outward;
                                        }
                                        if (join.nb_place_return > 0) {
                                            journey.nb_space_return = journey.nb_space_return - join.nb_place_return;
                                        }
                                    }
                                });
                            }
                        });
						deferred.resolve(journeys);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
            },
			getNextList: function (nb) {
				var deferred = $q.defer();
                $http.get('/api/journey/next/' + nb).
					success(function (result) {
						deferred.resolve(result);
					}).
					error(function(data, status) {
						deferred.reject('error ' + status + ' : ' + data);
					});
                return deferred.promise;
			},
            create: function (journey) {
                var deferred = $q.defer();
                $http.post('/api/journey', {journey: journey}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        if (result.type === 'success') {
                            if (result.msg === 'journeyCreated') {
                                deferred.resolve(result.journey);
                            } else {
                                deferred.resolve(result.journeyKey);
                            }
                        } else  {
                            deferred.reject('error : ' + result.msg);
                        }
                    }).
                    error(function (data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            confirm: function (key) {
                var deferred = $q.defer();
                $http.post('/api/journey/confirm', {key: key}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        if (result.type === 'success') {
                            deferred.resolve(result.journey);
                        } else  {
                            deferred.reject('error : ' + result.msg);
                        }
                    }).
                    error(function (data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            update: function (journey) {
                var deferred = $q.defer();
                $http.put('/api/journey', {journey: journey}).
                    success(function (result) {
                    if (result.type === 'success') {
                        $rootScope.$broadcast('USER_MSG', result.msg);
                        deferred.resolve(result.msg);
                    } else  {
                        deferred.reject('error : ' + result.msg);
                    }
                    }).
                    error(function (data, status) {
						deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            togglePayed : function (journeyId) {
                var deferred = $q.defer();
                $http.post('/api/admin/journey/payed', {id: journeyId}).
                    success(function (result) {
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            },
            cancel: function (journeyId) {
                var deferred = $q.defer();
                $http.post('/api/journey/cancel', {id: journeyId}).
                    success(function (result) {
                        $rootScope.$broadcast('USER_MSG', result);
                        deferred.resolve(result);
                    }).
                    error(function(data, status) {
                        deferred.reject('error ' + status + ' : ' + data);
                    });
                return deferred.promise;
            }
        };
    });

