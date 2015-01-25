/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */

angular.module('runnable.controllers', []).
	controller('RunnableMainController', function ($scope, $rootScope, $q, USER_ROLES, AUTH_EVENTS,
												   AuthService, USER_MSG, User, Session) {
		$rootScope.currentUser = null;
		$rootScope.userRoles = USER_ROLES;
		$rootScope.isAuthenticated = false;
		$rootScope.isAdmin = false;
		$rootScope.isAuthorized = AuthService.isAuthorized;

		$scope.setCurrentUser = function (user) {
			Session.create(user);
			$rootScope.isAuthenticated = user.isActive;
			$rootScope.isAdmin = AuthService.isAuthorized([USER_ROLES.admin]);
			$rootScope.currentUser = user;
		};

		var userPromise = User.getUser(),
			all = $q.all([userPromise]);
		all.then(function (res) {
			$scope.setCurrentUser(res[0]);
		});
		$scope.switchLoginToReset = function () {
			$scope.forLogin = false;
			$scope.forReset = true;
		};
		$scope.showLogin = function () {
			$scope.forLogin = true;
			$scope.forReset = false;
			angular.element('#loginModal').modal('show');
		};
		$scope.inviteFriend = function () {
			angular.element('#modalInviteFriends').modal('show');
		};
		$rootScope.$on('USER_MSG', function (event, msg) {
			var obj_msg = angular.fromJson(msg);
			var text = USER_MSG[obj_msg.msg];
			if (!text) {
				text = obj_msg.msg; }
			noty({
					layout: 'top',
					theme: 'defaultTheme',
					type: obj_msg.type,
					text: text, // can be html or string
					dismissQueue: true, // If you want to use queue feature set this true
					template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
					animation: {
						open: {height: 'toggle'},
						close: {height: 'toggle'},
						easing: 'swing',
						speed: 500 // opening & closing animation speed
					},
					timeout: 5000, // delay for closing event. Set false for sticky notifications
					maxVisible: 5, // you can set max visible notification for dismissQueue true option,
					killer: false, // for close all notifications before show
					closeWith: ['click'] // ['click', 'button', 'hover']
				});
		});
	}).
	controller('RunnableSharedController', function ($scope, Session, User) {
		$scope.invitForm = {
			"inviteMessage": "J’utilise My Run Trip pour organiser mes voyages jusqu'aux différentes courses. " +
			"Cela me permet de faire des économies sur tous mes trajets. " +
			"Rejoins moi en t’inscrivant sur http://www.myruntrip.fr pour que nous puissions organiser ensemble notre voyage " +
			"jusqu'à la prochaine course.- " + Session.userFirstname,
			"inviteEmails": ""
		};
		$scope.inviteFriends = function (inviteData) {
			angular.element('#modalInviteFriends').modal('hide');
			User.inviteFriends(inviteData);
			inviteData.inviteEmails = "";
		};
	}).
	controller('RunnableLoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
		$scope.credentials = {
			username: '',
			password: ''
		};
		$scope.login = function (credentials) {
			AuthService.login(credentials).then(function (user) {
				$scope.setCurrentUser(user);
				$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			}, function () {
				$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
			});
			angular.element('#loginModal').modal('hide');
		};
		$scope.reset = function (email) {
			AuthService.reset(email);
			angular.element('#loginModal').modal('hide');
		};
	}).
	controller('RunnableIndexController', function ($scope, $q, $timeout, Run, User, Journey, GoogleMapApi) {
		'use strict';
		$scope.page = 'Index';
		$scope.nbRunItems = 4;
		$scope.nbJourneyItems = 4;
		var runPromise = Run.getNextList($scope.nbRunItems),
			journeyPromise = Journey.getNextList($scope.nbJourneyItems),
			all = $q.all([runPromise, journeyPromise]);
		all.then(function (res) {
			$scope.listRun = res[0];
			$scope.listJourney = res[1];
			//timeout in order to wait the page to be loaded
			$timeout( function() {
				angular.forEach($scope.listJourney, function (journey) {
					var value = 'map_canvas_' + journey.id;
					GoogleMapApi.initMap(value);
					GoogleMapApi.showDirection(value, journey.address_start, journey.Run.address_start);
				});
			});
		});
		$scope.createUser = function (user) {
			User.create(user);
		};
	}).
	controller('RunnableProfileController', function ($scope, $q, $rootScope, $location, $sce, User) {
		'use strict';
		$scope.page = 'Profile';
		var userItraRunPromise = User.getItraRuns(),
			userJourneyPromise = User.getJourney(),
			userJoinPromise = User.getJoin(),
			all = $q.all([userItraRunPromise, userJourneyPromise, userJoinPromise]);
		all.then(function (res) {
			$scope.itraRuns = $sce.trustAsHtml(res[0]);
			$scope.userJourney = res[1];
			$scope.userJoin = res[2];
			$scope.passwords = {};
			if (!$rootScope.isAuthenticated) {
				$location.path('/');
			}
			angular.forEach($scope.userJourney, function (journey) {
				var nb_free_place_outward = journey.nb_space_outward,
					nb_free_place_return = journey.nb_space_return;
				angular.forEach(journey.Joins, function (join) {
					nb_free_place_outward = nb_free_place_outward - join.nb_place_outward;
					nb_free_place_return = nb_free_place_return - join.nb_place_return;
				});
				journey.nb_free_space_outward = nb_free_place_outward;
				journey.nb_free_space_return = nb_free_place_return;
			});
		});
		$scope.updatePassword = function (passwords, form) {
			if (form) {
				form.$setPristine();
				form.$setUntouched();
			}
			User.updatePassword(passwords);
			$scope.passwords = {};
		};
		$scope.updateUserInfo = function (userInfo) {
			console.log('TO BE IMPLEMENTED : Update user info');
		};
	}).
	controller('RunnableAdminController', function ($scope, $q, $rootScope, $location, AuthService, User, Run, Journey, Join) {
		'use strict';
		$scope.page = 'Admin';
		var userListPromise = User.getList(),
			runListPromise = Run.getList(),
			journeyListPromise = Journey.getList(),
			joinListPromise = Join.getList(),
			all = $q.all([userListPromise, runListPromise, journeyListPromise, joinListPromise]);
		all.then(function (res) {
			$scope.userList = res[0];
			$scope.runList = res[1];
			$scope.journeyList = res[2];
			$scope.joinList = res[3];
		});
		$scope.userToggleActive = function(user) {
			console.log('Toggle active for user : ' + user.id);
			User.userToggleActive(user.id);
			if (user.isActive) {
				user.isActive = false;
			} else {
				user.isActive = true;
			}
		};
		$scope.userEdit = function (user) {
			console.log('Edit user ' + user.id);
			$scope.userEdited = user;
			angular.element('#userEditModal').modal('show');
		};
		$scope.userSave = function (user) {
			console.log('Save edited user ' + user.firstname);
			angular.element('#userEditModal').modal('hide');
			$scope.userEdited = null;
		};
		$scope.userResetPassword = function (user) {
			AuthService.reset(user.email);
		};
		$scope.userTrash = function (user) {
			console.log('NOT YET IMPLEMENTED : Trash the user ' + user.id);
		};
		$scope.runToggleActive = function(run) {
			console.log('Toggle active for run : ' + run.id);
			Run.toogleActive(run.id);
			if (run.is_active) {
				run.is_active = false;
			} else {
				run.is_active = true;
			}
		};
	}).
	controller('RunnableRunDetailController', function ($scope, $q, $timeout, $routeParams, $location,
														Run, Journey, GoogleMapApi, Session, Participate) {
        'use strict';
        $scope.page = 'Run';
		$scope.runId = $routeParams.runId;
		var runPromise = Run.getDetail($scope.runId),
			journeyPromise = Journey.getListForRun($scope.runId),
            all = $q.all([runPromise, journeyPromise]);
        all.then(function (res) {
			$scope.run = res[0];
			$scope.journeyList = res[1];
			$timeout( function() {
				var obj = 'map_canvas_run';
				GoogleMapApi.initMap(obj, $scope.run.address_start);
				angular.forEach($scope.journeyList, function (journey) {
					GoogleMapApi.showDirection(obj, journey.address_start, $scope.run.address_start);
				});
			});
			if (Session.userAddress) {
				angular.forEach($scope.journeyList, function (journey) {
					GoogleMapApi.getDistance(Session.userAddress, journey.address_start).then(function (result) {
						journey.userDistance = result;
					});
				});
			}
		});
		$scope.createJourney = function () {
			console.log('Email user : ' + Session.userEmail);
			if (!Session.userEmail) {
				$scope.showLogin();
			} else {
				$location.path('/journey-create');
			}
		};
        $scope.participateRun = function () {
            if (!Session.userEmail) {
                $scope.showLogin();
            } else {
                Participate.add($scope.run.id);
            }
        };
    }).
    controller('RunnableRunCreateController', function ($scope, $q, $timeout, Run, GoogleMapApi) {
        'use strict';
        $scope.page = 'Run';
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
			$timeout( function() {
				GoogleMapApi.initMap('map_canvas');
			});
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
    controller('RunnableRunController', function ($scope, $q, Run) {
        'use strict';
        $scope.page = 'Run';
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
		});
    }).
	controller('RunnableJourneyDetailController', function ($scope, $q, $routeParams, $rootScope, $timeout,
															Run, Journey, Join, GoogleMapApi, MyRunTripFees, Session) {
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
			$scope.reserved_outward = 0;
			$scope.reserved_return = 0;
			angular.forEach($scope.joinList, function (join) {
				$scope.reserved_outward += join.nb_place_outward;
				$scope.reserved_return += join.nb_place_return;
				if (join.JourneyId == $scope.journeyId && join.UserId === $rootScope.currentUser.id) {
					$scope.joined = 1;
				}
			});
			$timeout( function() {
				var obj = "map_canvas";
				GoogleMapApi.initMap(obj);
				GoogleMapApi.showDirection(obj, $scope.journey.address_start, $scope.journey.run.address_start);
			});
			$scope.nbFreeSpaceOutward = function () {
				return parseInt($scope.journey.nb_space_outward) - parseInt($scope.reserved_outward);
			};
			$scope.nbFreeSpaceReturn = function () {
				return parseInt($scope.journey.nb_space_return) - parseInt($scope.reserved_return);
			};
			$scope.nbFreeSpace = function () {
				return $scope.nbFreeSpaceOutward + $scope.nbFreeSpaceReturn;
			};
			$scope.getFreeSpaceOutward = function() {
				var result = [], start = 1,
					end = parseInt($scope.journey.nb_space_outward) - parseInt($scope.reserved_outward);
				for (var i = start; i <= end; i++) {
					result.push({id: i});
				}
				return result;
			};
			$scope.getFreeSpaceReturn = function() {
				var result = [], start = 1,
					end = parseInt($scope.journey.nb_space_return) - parseInt($scope.reserved_return);
				for (var i = start; i <= end; i++) {
					result.push({id: i});
				}
				return result;
			};
			$scope.nbFreeSpaceListOutward = $scope.getFreeSpaceOutward();
			$scope.nbFreeSpaceListReturn = $scope.getFreeSpaceReturn();
		});
		$scope.selectNbPlaceOutward = function () {

		};
		$scope.showJoinForm = function () {
			if (!Session.userEmail) {
				$scope.showLogin();
			} else {
				angular.element('#clientModal').modal('show');
			}
		};
		$scope.joinJourney = function () {
			$scope.joined = 1;
			$scope.reserved_outward = $scope.reserved_outward + $scope.selectedPlaceOutward;
			$scope.reserved_return = $scope.reserved_return + $scope.selectedPlaceReturn;
			Join.addJoin($scope.journeyId, $scope.selectedPlaceOutward, $scope.selectedPlaceReturn);
		};
		$scope.removeJoinJourney = function () {
			$scope.joined = 0;
		};
		$scope.calculateFees = function () {
			var fees = 0;
			if ($scope.selectedPlaceOutward) {
				fees += $scope.selectedPlaceOutward * MyRunTripFees.getFees($scope.journey.date_start_outward,
																			$scope.journey.time_start_outward,
																			$scope.journey.amount);
			}
			if ($scope.selectedPlaceReturn) {
				fees += $scope.selectedPlaceReturn * MyRunTripFees.getFees($scope.journey.date_start_return,
																			$scope.journey.time_start_return,
																			$scope.journey.amount);
			}
			return fees;
		};
	}).
	controller('RunnableJourneyCreateController', function ($scope, $q, $timeout, Run, GoogleMapApi) {
        'use strict';
        $scope.page = 'Journey';
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.runList = res[0];
			$scope.outward = true;
			$scope.return = true;
			$scope.parcoursModeList = [
				{code: 'aller-retour', name: 'Aller-Retour'},
				{code: 'aller', name: 'Aller'},
				{code: 'retour', name: 'Retour'} ];
			$scope.journey = {};
			$scope.journey.journey_type = $scope.parcoursModeList[0].code;
			$timeout( function() {
				GoogleMapApi.initMap('map_canvas');
			});
		});
		$scope.journeyTypeChange = function () {
			if ($scope.journey.journey_type ===  'aller-retour') {
				$scope.outward = true;
				$scope.return = true;
			} else if ($scope.journey.journey_type ===  'aller') {
				$scope.outward = true;
				$scope.return = false;
			} else if ($scope.journey.journey_type ===  'retour') {
				$scope.outward = false;
				$scope.return = true;
			}
		};
		$scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
		$scope.showMapInfo = function () {
			GoogleMapApi.resetDirection('map_canvas');
			GoogleMapApi.showDirection('map_canvas', $scope.source, $scope.destination);
			GoogleMapApi.getDistance($scope.source, $scope.destination).then(function (result) {
				$scope.distance = result.distance;
				$scope.duration = result.duration;
			});
		};
		$scope.selectDestination = function (run) {
			if (run) {
				$scope.destination = run.address_start;
				if ($scope.source) {
					$scope.showMapInfo();
				}
			}
		};
		$scope.selectSource = function (address) {
			$scope.source = address;
			if ($scope.destination) {
				$scope.showMapInfo();
			}
		}
	}).
	controller('RunnableMyJourneyController', function ($scope, $q, $timeout, User, Discussion,
														GoogleMapApi, Socket, Session) {
		'use strict';
		$scope.page = 'MyJourney';
		var userJourneyPromise = User.getJourney(),
			userJoinPromise = User.getJoin(),
			all = $q.all([userJourneyPromise, userJoinPromise]);
		all.then(function (res) {
			$scope.userJourney = res[0];
			$scope.userJoin = res[1];
			angular.forEach($scope.userJourney, function (journey) {
				var freeSpace = User.getJourneyFreeSpace(journey);
				journey.nb_free_place_outward = freeSpace.nb_free_place_outward;
				journey.nb_free_place_return = freeSpace.nb_free_place_return;
			});
			angular.forEach($scope.userJoin, function (join) {
				var freeSpace = User.getJourneyFreeSpace(join.Journey);
				join.Journey.nb_free_place_outward = freeSpace.nb_free_place_outward;
				join.Journey.nb_free_place_return = freeSpace.nb_free_place_return;
			});
		});
		$scope.showJourneyModal = function (journey, join) {
			var discussionUsersPromise = Discussion.getUsers(journey.id),
				discussionMessagesPromise = Discussion.getMessages(journey.id),
				all = $q.all([discussionUsersPromise, discussionMessagesPromise]);
			$scope.selectedJourney = journey;
			if (join) {
				$scope.selectedJoin = join;
			} else {
				$scope.selectedJoin = null;
			}
			all.then(function (res) {
				$scope.discussionUsers = res[0];
				$scope.discussionMessages = res[1];
				$timeout(function () {
					var obj = "map_canvas";
					GoogleMapApi.initMap(obj);
					GoogleMapApi.showDirection(obj, $scope.selectedJourney.address_start,
						$scope.selectedJourney.Run.address_start);
				});
				angular.element('#journeyModal').modal('show');
			});
		};
		$scope.sendMessage = function () {
			var text = String($scope.newMessageEntry).replace(/<[^>]+>/gm, '');
			$scope.newMessageEntry = '';
			$scope.discussionMessages.unshift(
				{	"message": text,
					"createdAt": Date.now(),
					"User":
						{	"firstname": Session.userFirstname,
							"lastname": Session.userLastname}
				});
			/* -- Socket messsage deactivate until having manage room for live notification
			Socket.emit('discussion:newMessage',
				{"message": text, "createdAt": Date.now(), "User":
					{"firstname": Session.userFirstname, "lastname": Session.userLastname}
				});
			*/
			Discussion.addMessage(text, $scope.selectedJourney.id);
		};
		/*
		Socket.on('discussion:newMessage', function (data) {
			$scope.discussionMessages.unshift(
				{	"message": data.message,
					"createdAt": data.createdAt,
					"User":
						{	"firstname": data.User.firstname,
							"lastname": data.User.lastname}
				});
		});
		*/
	}).
	controller('RunnableUserPublicProfileController', function ($scope, $q, $routeParams, User) {
		'use strict';
		$scope.userId = $routeParams.userId;
		var userPromise = User.getPublicInfo($scope.userId),
			userItraRunPromise = User.getItraRuns($scope.userId),
			all = $q.all([userPromise, userItraRunPromise]);
		all.then(function (res) {
			$scope.userPublicInfo = res[0];
			$scope.userItraRun = res[1];
			var now = new Date().getTime(),
				creation = new Date($scope.userPublicInfo.createdAt).getTime();
			$scope.sinceCreation = parseInt((now-creation)/(24*3600*1000));
			$scope.userNbJoin = $scope.userPublicInfo.Joins.length;
			$scope.userNbJourney = $scope.userPublicInfo.Journeys.length;
		});
	}).
	controller('RunnableUserInboxController', function ($scope) {
		'use strict';
		console.log('RunnableUserInboxController');
	}).
	controller('RunnableJourneyController', function ($scope, $q, $http, $timeout, Run, Journey, GoogleMapApi) {
        'use strict';
        $scope.page = 'Journey';
		var journeyPromise = Journey.getList(),
            all = $q.all([journeyPromise]);
        all.then(function (res) {
			$scope.journeyList = res[0];
			$timeout( function() {
				angular.forEach($scope.journeyList, function (journey) {
					var value = 'map_canvas_' + journey.id;
					if (journey.date_start_outward) {
						journey.startDate = journey.date_start_outward;
					} else {
						journey.startDate = journey.date_start_return;
					}
					GoogleMapApi.initMap(value);
					GoogleMapApi.showDirection(value, journey.address_start, journey.Run.address_start);
				});
			});
		});
	});