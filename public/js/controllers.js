/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */
'use strict';

angular.module('runnable.controllers', []).
	controller('RunnableMainController', function ($scope, $rootScope, $q, USER_ROLES, AUTH_EVENTS,
												   AuthService, USER_MSG, User, Session, Inbox) {
		$rootScope.currentUser = null;
		$rootScope.userRoles = USER_ROLES;
		$rootScope.isAuthenticated = false;
		$rootScope.isAdmin = false;
		$rootScope.isAuthorized = AuthService.isAuthorized;

		$scope.setCurrentUser = function (user, unread) {
			Session.create(user);
			$rootScope.userUnreadEmail = unread;
			$rootScope.isAuthenticated = user.isActive;
			$rootScope.isAdmin = AuthService.isAuthorized([USER_ROLES.admin]);
			$rootScope.currentUser = user;
		};

		var userPromise = User.getUser(),
			inboxPromise = Inbox.nbUnreadMessage(),
			all = $q.all([userPromise, inboxPromise]);
		all.then(function (res) {
			$scope.setCurrentUser(res[0], res[1]);
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
			inviteMessage: 'J’utilise My Run Trip pour organiser mes voyages jusqu\'aux différentes courses. ' +
			'Cela me permet de faire des économies sur tous mes trajets. ' +
			'Rejoins moi en t’inscrivant sur http://www.myruntrip.fr pour que nous puissions organiser ensemble notre voyage ' +
			'jusqu\'à la prochaine course.- ' + Session.userFirstname,
			inviteEmails: ''
		};
		$scope.inviteFriends = function (inviteData) {
			angular.element('#modalInviteFriends').modal('hide');
			User.inviteFriends(inviteData);
			inviteData.inviteEmails = '';
		};
	}).
	controller('RunnableLoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
		$scope.credentials = {
			username: '',
			password: ''
		};
		$scope.login = function (credentials) {
			AuthService.login(credentials).then(function (user) {
				var unread = 0;
				angular.forEach(user.Inboxes, function (inbox) {
					if (inbox.is_read === false) {
						unread = unread + 1;
					}
				});
				$scope.setCurrentUser(user, unread);
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
	controller('RunnableIndexController', function ($scope, $q, $timeout, Run, User, Journey, GoogleMapApi, Email,
                                                    ValidationJourney) {
		$scope.page = 'Index';
		$scope.nbRunItems = 4;
		$scope.nbJourneyItems = 4;
		var runPromise = Run.getNextList($scope.nbRunItems),
			journeyPromise = Journey.getNextList($scope.nbJourneyItems),
			feedbackPromise = ValidationJourney.userFeedback(),
			all = $q.all([runPromise, journeyPromise, feedbackPromise]);
		all.then(function (res) {
			$scope.listRun = res[0];
			$scope.listJourney = res[1];
            $scope.userFeedback = res[2];
			//timeout in order to wait the page to be loaded
			$timeout( function() {
				angular.forEach($scope.listJourney, function (journey) {
					var value = 'map_canvas_' + journey.id;
					GoogleMapApi.initMap(value);
					GoogleMapApi.showDirection(value, journey.address_start, journey.Run.address_start);
				});
			});
		});
		$scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
		$scope.createUser = function (user) {
			User.create(user);
		};
        $scope.sendContact = function (contact) {
            var data = {};
            $scope.mailContact = {};
            data.emails = 'jbillay@gmail.com';
            data.title = '[Runnable] Demande info : ' + contact.demande;
            data.message = 'Information concernant' + contact.demande + '<br>' +
                            'De la part de : ' + contact.email + '<br>' +
                            'Content : <br>' + contact.content + '<br>';
            data.confirm = 'infoRequestReceived';
            Email.send(data);
        };
	}).
	controller('RunnableProfileController', function ($scope, $q, $rootScope, $location, $sce, User, BankAccount, fileReader) {
		$scope.page = 'Profile';
		var userItraRunPromise = User.getItraRuns(),
			userBankAccountPromise = BankAccount.get(),
            all = $q.all([userItraRunPromise, userBankAccountPromise]);
		all.then(function (res) {
			$scope.itraRuns = $sce.trustAsHtml(res[0]);
			$scope.bankAccount = res[1];
			$scope.passwords = {};
            if ($rootScope.currentUser.picture) {
                $scope.imageSrc = $rootScope.currentUser.picture;
            }
			if (!$rootScope.isAuthenticated) {
				$location.path('/');
			}
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
			var userData = {
				firstname: userInfo.firstname,
				lastname: userInfo.lastname,
				address: userInfo.address,
				phone: userInfo.phone,
				email: userInfo.email
			};
			User.update(userData);
		};
		$scope.saveBankAccount = function (bankAccountInfo) {
			console.log('Save bank account : %j', bankAccountInfo);
			BankAccount.save(bankAccountInfo);
		};
        $scope.erase = function () {
            User.deleteMe();
        };
        $scope.getFile = function (file) {
            fileReader.readAsDataUrl(file, $scope)
                .then(function(result) {
                    $scope.file = file;
                    $scope.imageSrc = result;
                });
        };
        $scope.saveFile = function () {
            if ($scope.file) {
                fileReader.savePicture($scope.file);
            }
        };
        $scope.deleteFile = function () {
            $scope.imageSrc = null;
            fileReader.deletePicture($scope.file);
        };
    }).
	controller('RunnableAdminController', function ($scope, $q, $rootScope, $location, AuthService, User, Run, Journey, Join) {
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
		$scope.userTrash = function (idx) {
            var user = $scope.userList[idx];
            $scope.userList.splice(idx, 1);
            User.delete(user.id);
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
        $scope.page = 'Run';
		$scope.runId = $routeParams.runId;
		var runPromise = Run.getDetail($scope.runId),
			journeyPromise = Journey.getListForRun($scope.runId),
            participatePromise = Participate.runList($scope.runId),
            all = $q.all([runPromise, journeyPromise, participatePromise]);
        all.then(function (res) {
			$scope.run = res[0];
			$scope.journeyList = res[1];
			$scope.participateList = res[2];
            $scope.nbJoiner = $scope.participateList.length;
			$timeout( function() {
				var obj = 'map_canvas_run';
				GoogleMapApi.initMap(obj, $scope.run.address_start);
				angular.forEach($scope.journeyList, function (journey) {
					GoogleMapApi.showDirection(obj, journey.address_start, $scope.run.address_start);
				});
			});
			if (Session.userAddress) {
                angular.forEach($scope.participateList, function (participate) {
                    $scope.userJoined = false;
                    if (participate.userId === Session.id) {
                        $scope.userJoined = true;
                    }
                });
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
				$location.path('/journey-create-' + $scope.runId);
			}
		};
        $scope.participateRun = function () {
            if (!Session.userEmail) {
                $scope.showLogin();
            } else {
                Participate.add($scope.run.id);
                $scope.userJoined = true;
            }
        };
    }).
    controller('RunnableRunCreateController', function ($scope, $q, $timeout, Run, GoogleMapApi) {
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
    controller('RunnableRunController', function ($scope, $q, Run, $timeout, GoogleMapApi, DEFAULT_DISTANCE) {
        $scope.page = 'Run';
		$scope.default_distance = DEFAULT_DISTANCE;
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
            $scope.advancedSearch = 0;
		});
        $scope.today = new Date();
        $scope.calendar = {
            opened: {},
            dateFormat: 'dd/MM/yyyy',
            dateOptions: {
                formatYear: 'yy',
                startingDay: 1
            },
            open: function($event, which) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.calendar.opened[which] = true;
            }
        };
        $scope.switchSearch = function () {
            $scope.advancedSearch = $scope.advancedSearch ? 0 : 1;
			$timeout( function() {
				$('[data-toggle="tooltip"]').tooltip();
			});
        };
		$scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
        $scope.launchSearch = function (advancedSearch) {
			if (!advancedSearch.run_adv_distance) {
				advancedSearch.run_adv_distance = DEFAULT_DISTANCE;
			}
            if ($scope.run_name) {
                advancedSearch.run_name = $scope.run_name;
            }
            Run.search(advancedSearch).then(function(runs) {
                $scope.listRun = runs;
				if (advancedSearch.run_adv_distance === DEFAULT_DISTANCE) {
					advancedSearch.run_adv_distance = null;
				}
            });
        };
    }).
	controller('RunnableJourneyDetailController', function ($scope, $q, $routeParams, $rootScope, $timeout,
															Run, Journey, Join, GoogleMapApi, MyRunTripFees, Session,
                                                            Inbox) {
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
				if (join.JourneyId === $scope.journeyId && join.UserId === $rootScope.currentUser.id) {
					$scope.joined = 1;
				}
			});
			$timeout( function() {
				var obj = 'map_canvas';
				GoogleMapApi.initMap(obj);
				GoogleMapApi.showDirection(obj, $scope.journey.address_start, $scope.journey.Run.address_start);
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
		$scope.showJoinForm = function () {
			if (!Session.userEmail) {
				$scope.showLogin();
			} else {
				var invoice_key = Math.random().toString(36).substring(2, 7).toUpperCase();
				var d = new Date();
				var curr_date = ('0' + d.getDate()).slice(-2);
				var curr_month = ('0' + (d.getMonth() + 1)).slice(-2);
				var curr_year = d.getFullYear();
				var invoice_date = curr_year + '' + curr_month + '' + curr_date;
				$scope.invoice_ref = 'MRT' + invoice_date + invoice_key;
				angular.element('#clientModal').modal('show');
			}
		};
		$scope.joinJourney = function (placeOutward, placeReturn) {
			var title = 'Validation inscription au voyage pour la course ' + $scope.journey.Run.name,
                textMessage = 'Nous avons bien pris en compte votre inscriptions pour la course ' +
                    $scope.journey.Run.name + '. Nous sommes en attente de la validation du paiement.';
            placeOutward = placeOutward  || 0;
            placeReturn = placeReturn  || 0;
			var amount = (placeOutward + placeReturn) * $scope.journey.amount +
						$scope.calculateFees(placeOutward, placeReturn, $scope.journey);
            var fees = $scope.calculateFees(placeOutward, placeReturn, $scope.journey);
            $scope.joined = 1;
			amount = amount.toFixed(2);
			fees = fees.toFixed(2);
			$scope.reserved_outward = $scope.reserved_outward + placeOutward;
			$scope.reserved_return = $scope.reserved_return + placeReturn;
			Join.addJoin($scope.journeyId, placeOutward, placeReturn, amount, fees, $scope.invoice_ref);
            Inbox.addMessage(title, textMessage, Session.userId);
		};
		$scope.removeJoinJourney = function () {
			$scope.joined = 0;
		};
		$scope.calculateFees = function (outwardPlace, returnPlace, journey) {
			var fees = 0;
			if (outwardPlace) {
				fees += outwardPlace * MyRunTripFees.getFees(journey.date_start_outward,
                                                             journey.time_start_outward,
                                                             journey.amount);
			}
			if (returnPlace) {
				fees += returnPlace * MyRunTripFees.getFees(journey.date_start_return,
															journey.time_start_return,
															journey.amount);
			}
			return fees;
		};
	}).
	controller('RunnableJourneyCreateController', function ($scope, $q, $timeout, Run, GoogleMapApi, $routeParams) {
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
            if ($routeParams.runId) {
                $scope.runList.forEach(function (run) {
                    if (run.id === parseInt($routeParams.runId)) {
                        $scope.run_id = run;
                        $scope.selectDestination(run);
                    }
                });
            }
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
		};
	}).
	controller('RunnableMyJourneyController', function ($scope, $q, $timeout, User, Discussion,
														GoogleMapApi, Socket, Session, Inbox, ValidationJourney) {
		$scope.page = 'MyJourney';
		var userJourneyPromise = User.getJourney(),
			userJoinPromise = User.getJoin(),
			all = $q.all([userJourneyPromise, userJoinPromise]);
		all.then(function (res) {
			$scope.userJourney = res[0];
			$scope.userJoin = res[1];
            $scope.dateActual = new Date().getTime();
			angular.forEach($scope.userJourney, function (journey) {
				var freeSpace = User.getJourneyFreeSpace(journey);
				journey.nb_free_place_outward = freeSpace.nb_free_place_outward;
				journey.nb_free_place_return = freeSpace.nb_free_place_return;
			});
			angular.forEach($scope.userJoin, function (join) {
				var freeSpace = User.getJourneyFreeSpace(join.Journey);
                angular.forEach(join.ValidationJourneys, function (validation) {
                    if (validation.UserId === Session.userId) {
                        join.validated = true;
                    }
                });
                if (join.Journey.date_start_return > join.Journey.date_start_outward) {
                    join.Journey.date_max = new Date(join.Journey.date_start_return).getTime();
                } else {
                    join.Journey.date_max = new Date(join.Journey.date_start_outward).getTime();
                }
				join.Journey.nb_free_place_outward = freeSpace.nb_free_place_outward;
				join.Journey.nb_free_place_return = freeSpace.nb_free_place_return;
			});
		});
        $scope.showJourneyValidationModal = function (join) {
            $scope.vadidationJoin = join;
            $scope.validationForm = {
                commentDriver: '',
                commentService: '',
                rate_driver: '',
                rate_service: ''
            };
            angular.element('#journeyValidationModal').modal('show');
            $scope.sendValidation = function (validation) {
                angular.element('#journeyValidationModal').modal('hide');
                ValidationJourney.validation($scope.vadidationJoin.id, validation.commentDriver,
                                                validation.commentService, validation.rate_driver,
                                                validation.rate_service);
            };
        };
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
					var obj = 'map_canvas';
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
				{	message: text,
					createdAt: Date.now(),
					User:
						{	firstname: Session.userFirstname,
							lastname: Session.userLastname}
				});
			Discussion.addMessage(text, $scope.selectedJourney.id);
			angular.forEach($scope.discussionUsers, function (user) {
				if (user.id !== Session.userId) {
                    var title = 'Nouveau message concernant le trajet pour la course ' +
							$scope.selectedJourney.Run.name,
						textMessage = Session.userFirstname + ' '+ Session.userLastname + 
							' dit : "' + text + '"';
					Inbox.addMessage(title, textMessage, user.id);
				}
			});
		};
	}).
	controller('RunnableUserPublicProfileController', function ($scope, $q, $routeParams, User) {
		$scope.userId = $routeParams.userId;
		var userPromise = User.getPublicInfo($scope.userId),
			userDriverPromise = User.getPublicDriverInfo($scope.userId),
			userItraRunPromise = User.getItraRuns($scope.userId),
			all = $q.all([userPromise, userDriverPromise, userItraRunPromise]);
		all.then(function (res) {
			$scope.userPublicInfo = res[0];
			$scope.userDriverPublicInfo = res[1];
			$scope.userItraRun = res[2];
            $scope.driverComments = [];
            $scope.driverRate = 0;
            var ratesSum = 0;
            angular.forEach($scope.userDriverPublicInfo, function (driverInfo) {
                $scope.driverComments.push(driverInfo.comment_driver);
                ratesSum = ratesSum + driverInfo.rate_driver;
            });
            $scope.driverComments.splice(5, $scope.driverComments.length);
            if ($scope.userDriverPublicInfo.length > 0) {
                $scope.driverRate = ratesSum / $scope.userDriverPublicInfo.length;
            }
			var now = new Date().getTime(),
				creation = new Date($scope.userPublicInfo.createdAt).getTime();
			$scope.sinceCreation = parseInt((now-creation)/(24*3600*1000));
			$scope.userNbJoin = $scope.userPublicInfo.Joins.length;
			$scope.userNbJourney = $scope.userPublicInfo.Journeys.length;
		});
	}).
    controller('RunnableInvoiceController', function ($scope, $q, Invoice) {
        var invoiceUserPromise = Invoice.getByUser(),
            invoiceDriverPromise = Invoice.getByDriver(),
            all = $q.all([invoiceUserPromise, invoiceDriverPromise]);
        all.then(function (res) {
            $scope.invoicesUser = res[0];
            $scope.invoicesDriver = res[1];
        });
    }).
    controller('RunnableCalendarController', function ($scope, $q, Participate) {
		$scope.events = [];
		$scope.eventSources = [$scope.events];
		$scope.uiConfig = {
			calendar: {
				height: 450,
				editable: true,
				header: {
					left: 'title',
					center: '',
					right: 'today prev,next'
				}
			}
		};
        var runPromise = Participate.userList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
            $scope.runParticpateList = res[0];
			angular.forEach($scope.runParticpateList, function (participe) {
				$scope.events.push({title: participe.Run.name, start: new Date(participe.Run.date_start)});
			});
			$scope.$apply(function () {
				$scope.eventSources = [$scope.events];
			});
        });
    }).
    controller('RunnableUserInboxController', function ($rootScope, $scope, $q, Inbox) {
		$scope.selectedMessage = 'Pas de message sélectionné';
		var inboxPromise = Inbox.getList(),
            all = $q.all([inboxPromise]);
        all.then(function (res) {
			$scope.inboxMessages = res[0];
			$scope.showMessage = function (message) {
				$scope.selectedMessage = message;
				if (!message.is_read) {
					Inbox.setAsRead(message.id);
					$rootScope.userUnreadEmail = $rootScope.userUnreadEmail - 1;
				}
			};
			$scope.removeMessage = function (id) {
				// TO BE IMPLEMENTED
				console.log('Delete message ' + id);
				Inbox.deleteMessage(id);
			};
		});
	}).
	controller('RunnableJourneyController', function ($scope, $q, $timeout, Run, Journey, GoogleMapApi) {
        $scope.page = 'Journey';
		var journeyPromise = Journey.getOpenList(),
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