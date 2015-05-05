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
	controller('RunnablePageController', function ($scope, $q, $routeParams, Page) {
		$scope.tag = $routeParams.tag;
		var pagePromise = Page.getByTag($routeParams.tag),
			all = $q.all([pagePromise]);
		all.then(function (res) {
			$scope.page = res[0];
		});
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
            $scope.userCreate = {};
			User.create(user);
		};
        $scope.sendContact = function (contact) {
            var data = {};
            $scope.mailContact = {};
            data.emails = 'jbillay@gmail.com';
            data.title = '[My Run Trip] Demande info : ' + contact.demande;
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
	controller('RunnableAdminController', function ($scope, $q, $rootScope, AuthService, User, Run,
                                                    Journey, Join, EmailOptions, BankAccount, Page) {
		$scope.page = 'Admin';
		var userListPromise = User.getList(),
			runListPromise = Run.getList(),
			journeyListPromise = Journey.getList(),
			joinListPromise = Join.getList(),
			EmailOptionsPromise = EmailOptions.get(),
			pageListPromise = Page.getList(),
			all = $q.all([userListPromise, runListPromise, journeyListPromise, joinListPromise,
                            EmailOptionsPromise, pageListPromise]);
		all.then(function (res) {
			$scope.userList = res[0];
			$scope.runList = res[1];
			$scope.journeyList = res[2];
			$scope.joinList = res[3];
			$scope.emailOption = res[4];
			$scope.pageList = res[5];
		});
		$scope.createPageForm = {
			'newPageName'     : ''};
		$scope.originForm = angular.copy($scope.createPageForm);
		$scope.userToggleActive = function(user) {
			console.log('Toggle active for user : ' + user.id);
			User.userToggleActive(user.id);
			if (user.isActive) {
				user.isActive = false;
			} else {
				user.isActive = true;
			}
		};
		$scope.submitEmailOptions = function (mailConfig) {
			EmailOptions.save(mailConfig);
		};
		$scope.editPage = function (page) {
			$scope.editedPage = page;
			angular.element('#adminEditPageModal').modal('show');
		};
		$scope.createPage = function () {
			var trimName = $scope.createPageForm.newPageName.trim();
			var withoutSpecChar = trimName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
			var tag = withoutSpecChar.replace(/\s/gi, '-');
			var page = {};
			page.title = trimName;
			page.tag = tag;
			page.content = '';
			$scope.pageList.push(page);
			$scope.createPageForm = angular.copy($scope.originForm);
			Page.save(page);
		};
		$scope.saveEditPage = function (editedPage) {
			angular.element('#adminEditPageModal').modal('hide');
			Page.save(editedPage);
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
        $scope.openJourneyAction = function (journey) {
            $scope.selectedJourney = journey;
            var userRIBPromise = BankAccount.getByUser(journey.User.id),
                all = $q.all([userRIBPromise]);
            all.then(function (res) {
                $scope.selectedJourneyUserRIB = res[0];
                $scope.selectedJourneyJoins = [];
                $scope.amountToPay = 0;
                angular.forEach($scope.joinList, function (join) {
                    if (join.JourneyId === $scope.selectedJourney.id && join.Invoice.status === 'completed') {
                        $scope.amountToPay += join.Invoice.amount - join.Invoice.fees;
                        $scope.selectedJourneyJoins.push(join);
                    }
                });
                angular.element('#adminJourneyAction').modal('show');
            });
        };
        $scope.journeyPayedToggle = function (state) {
            Journey.togglePayed($scope.selectedJourney.id);
            if (state) {
                $scope.selectedJourney.is_payed = false;
            } else {
                $scope.selectedJourney.is_payed = true;
            }
        };
        $scope.closeAdminJourney = function () {
            angular.element('#adminJourneyAction').modal('hide');
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
	controller('RunnableJourneyDetailController', function ($scope, $q, $routeParams, $rootScope, $timeout, $location,
															Run, Journey, Join, GoogleMapApi, MyRunTripFees, Session,
                                                            Inbox) {
		$scope.page = 'Journey';
		$scope.journeyId = parseInt($routeParams.journeyId);
		var journeyPromise = Journey.getDetail($scope.journeyId),
			joinPromise = Join.getListForJourney($scope.journeyId),
			all = $q.all([journeyPromise, joinPromise]);
		all.then(function (res) {
			$scope.journey = res[0];
            if ($scope.journey.is_canceled) {
                $location.path('/journey');
            }
			$scope.joinList = res[1];
			$scope.joined = 0;
			$scope.reserved_outward = 0;
			$scope.reserved_return = 0;
			angular.forEach($scope.joinList, function (join) {
				$scope.reserved_outward += join.nb_place_outward;
				$scope.reserved_return += join.nb_place_return;
				if ($rootScope.currentUser &&
                    join.JourneyId === $scope.journeyId &&
                    join.UserId === $rootScope.currentUser.id) {
					$scope.joined = 1;
					$scope.userJoin = join;
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
			var template = 'JourneySubmit',
                values = {runName: $scope.journey.Run.name };
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
			Join.add($scope.journeyId, placeOutward, placeReturn, amount, fees, $scope.invoice_ref);
            Inbox.addMessage(template, values, $rootScope.currentUser.id);
		};
        $scope.askValidationJoinCancelFromJourney = function () {
            angular.element('#validationModal').modal('show');
            $scope.validationMessage = 'Vous souhaitez annuler votre participation à ce voyage. ' +
                'Si vous confirmer vous receverez un remboursement d\'ici quelques jours ' +
                'du prix du voyage. Voulez vous confirmer cette demande ?';
			$scope.validationCallback = $scope.confirmValidation;
        };
        $scope.cancelValidation = function () {
            angular.element('#validationModal').modal('hide');
        };
		$scope.confirmValidation = function () {
            angular.element('#validationModal').modal('hide');
			var userTemplate = 'UserJoinJourneyCancel',
				driverTemplate = 'DriverJoinJourneyCancel',
                userValues = {runName: $scope.journey.Run.name },
                driverValues = {runName: $scope.journey.Run.name},
				placeOutwardReturn,
				placeReturnReturn;
			$scope.joined = 0;
			if ($scope.userJoin.nb_place_outward) {
				placeOutwardReturn = $scope.userJoin.nb_place_outward;
			}
			if ($scope.userJoin.nb_place_return) {
				placeReturnReturn = $scope.userJoin.nb_place_return;
			}
			$scope.reserved_outward = $scope.reserved_outward - placeOutwardReturn;
			$scope.reserved_return = $scope.reserved_return - placeReturnReturn;
			Join.cancel($scope.userJoin.id);
            Inbox.addMessage(driverTemplate, driverValues, $scope.journey.UserId);
            Inbox.addMessage(userTemplate, userValues, $rootScope.currentUser.id);
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
	controller('RunnableJourneyCreateController', function ($scope, $q, $timeout, $routeParams, $rootScope, $location,
                                                            Journey, Run, Inbox, GoogleMapApi) {
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
            $scope.carTypeList = [
                {code: 'citadine', name: 'Citadine'},
                {code: 'berline', name: 'Berline'},
                {code: 'break', name: 'Break'},
                {code: 'monospace', name: 'Monospace'},
                {code: 'suv', name: '4x4, SUV'},
                {code: 'coupe', name: 'Coupé'},
                {code: 'cabriolet', name: 'Cabriolet'}
            ];
			$scope.journey = {};
			$scope.journey.journey_type = $scope.parcoursModeList[0].code;
			$scope.journey.car_type = $scope.carTypeList[0].code;
			$timeout( function() {
				GoogleMapApi.initMap('map_canvas');
                $('#clockpicker_outward').clockpicker();
                $('#clockpicker_return').clockpicker();
			});
            if ($routeParams.runId) {
                $scope.journey.Run = $scope.runList[_.findIndex($scope.runList, 'id', parseInt($routeParams.runId))];
                $scope.selectDestination($scope.journey.Run);
                console.log($scope.journey.Run);
            }
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
		});
		$scope.journeyTypeChange = function () {
			if ($scope.journey.journey_type ===  'aller-retour') {
				$scope.outward = true;
				$scope.return = true;
			} else if ($scope.journey.journey_type ===  'aller') {
				$scope.outward = true;
				$scope.return = false;
                $scope.journey.date_start_return = null;
                $scope.journey.time_start_return = null;
                $scope.journey.nb_space_return = null;
			} else if ($scope.journey.journey_type ===  'retour') {
				$scope.outward = false;
				$scope.return = true;
                $scope.journey.date_start_outward = null;
                $scope.journey.time_start_outward = null;
                $scope.journey.nb_space_outward = null;
			}
		};
		$scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
		$scope.showMapInfo = function () {
			GoogleMapApi.resetDirection('map_canvas');
			GoogleMapApi.showDirection('map_canvas', $scope.source, $scope.destination);
			GoogleMapApi.getDistance($scope.source, $scope.destination).then(function (result) {
				$scope.journey.distance = result.distance;
				$scope.journey.duration = result.duration;
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
        $scope.submitJourney = function (journey) {
            var template = 'JourneyCreated',
                values = {runName: journey.Run.name };
            Journey.create(journey);
            Inbox.addMessage(template, values, $rootScope.currentUser.id);
            $location.path('/journey');
        };
	}).
	controller('RunnableMyJourneyController', function ($scope, $q, $timeout, $rootScope, User, Discussion, Join,
                                                        GoogleMapApi, Session, Inbox, ValidationJourney, Journey) {
		$scope.page = 'MyJourney';
		var userJourneyPromise = User.getJourney(),
			userJoinPromise = User.getJoin(),
			all = $q.all([userJourneyPromise, userJoinPromise]);
		all.then(function (res) {
			$scope.userJourney = res[0];
			$scope.userJoin = res[1];
            $scope.dateActual = new Date().getTime();
			angular.forEach($scope.userJourney, function (journey) {
				var freeSpacePromise = User.getJourneyFreeSpace(journey);
                all = $q.all([freeSpacePromise]);
                all.then(function (res) {
                    journey.nb_free_place_outward = res[0].nb_free_place_outward;
                    journey.nb_free_place_return = res[0].nb_free_place_return;
                });
			});
			angular.forEach($scope.userJoin, function (join) {
                // Check if journey has been validated by the user
                angular.forEach(join.ValidationJourneys, function (validation) {
                    if (validation.UserId === Session.userId) {
                        join.validated = true;
                    }
                });
                // Define max date to show validation form
                if (join.Journey.date_start_return > join.Journey.date_start_outward) {
                    join.Journey.date_max = new Date(join.Journey.date_start_return).getTime();
                } else {
                    join.Journey.date_max = new Date(join.Journey.date_start_outward).getTime();
                }
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
				angular.element('#journeyModal').modal('show');
			});
		};
        $scope.confirmValidationJourneyCancel = function () {
            angular.element('#validationModal').modal('hide');
            var driverTemplate = 'DriverJourneyCancel',
                values = {runName: $scope.cancelJourney.Run.name };
            $scope.userJourney.splice($scope.indexToBeRemoved, 1);
            Journey.cancel($scope.cancelJourney.id);
            Inbox.addMessage(driverTemplate, values, $rootScope.currentUser.id);
        };
        $scope.askValidationJourneyCancelFromMyJourney = function (journey, index) {
            angular.element('#validationModal').modal('show');
            $scope.cancelJourney = journey;
            $scope.indexToBeRemoved = index;
            $scope.validationMessage = 'Vous souhaitez annuler votre voyage pour cette course. ' +
            'Si vous confirmer tous les  participants seront informés de cette annulation. ' +
            'Voulez vous confirmer votre annulation ?';
            $scope.validationCallback = $scope.confirmValidationJourneyCancel;
        };
        $scope.confirmValidationJoinCancel = function () {
            angular.element('#validationModal').modal('hide');
            var userTemplate = 'UserJoinJourneyCancel',
                driverTemplate = 'DriverJoinJourneyCancel',
                values = {runName: $scope.cancelJoin.Journey.Run.name };
            $scope.userJoin.splice($scope.indexToBeRemoved, 1);
            Join.cancel($scope.cancelJoin.id);
            Inbox.addMessage(driverTemplate, values, $scope.cancelJoin.Journey.UserId);
            Inbox.addMessage(userTemplate, values, $rootScope.currentUser.id);
        };
        $scope.askValidationJoinCancelFromMyJourney = function (join, index) {
            angular.element('#validationModal').modal('show');
            $scope.cancelJoin = join;
            $scope.indexToBeRemoved = index;
            $scope.validationMessage = 'Vous souhaitez annuler votre participation à ce voyage. ' +
            'Si vous confirmer vous receverez un remboursement d\'ici quelques jours ' +
            'du prix du voyage. Voulez vous confirmer votre annulation ?';
            $scope.validationCallback = $scope.confirmValidationJoinCancel;
        };
        $scope.cancelValidation = function () {
            angular.element('#validationModal').modal('hide');
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
                    var values = {runName: $scope.selectedJourney.Run.name,
                                    userFirstname: Session.userFirstname,
                                    userLastname: Session.userLastname,
                                    text: text},
                        template = 'JourneyMessage';
                    Inbox.addMessage(template, values, user.id);
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
        });
    }).
    controller('RunnableUserInboxController', function ($rootScope, $scope, $q, Inbox) {
		$scope.selectedMessage = 'Pas de message sélectionné';
		var inboxPromise = Inbox.getList(),
            all = $q.all([inboxPromise]);
        all.then(function (res) {
			$scope.inboxMessages = res[0];
			$scope.showMessage = function (message, index) {
                $scope.selectedIndex = index;
				$scope.selectedMessage = message;
				if (!message.is_read) {
					Inbox.setAsRead(message.id);
					$rootScope.userUnreadEmail = $rootScope.userUnreadEmail - 1;
				}
			};
			$scope.removeMessage = function (list, index) {
                var id = list[index].id;
                list.splice(index, 1);
                $scope.selectedMessage = 'Pas de message sélectionné';
                Inbox.deleteMessage(id);
			};
		});
	}).
	controller('RunnableJourneyUpdateController', function ($scope, $q, $routeParams, $rootScope, $timeout, $location,
                                                            Run, Journey, Inbox, GoogleMapApi) {
        $scope.page = 'Journey';
        $scope.journeyId = parseInt($routeParams.journeyId);
        var journeyPromise = Journey.getDetail($scope.journeyId),
            runPromise = Run.getActiveList(),
            all = $q.all([journeyPromise, runPromise]);
        all.then(function (res) {
            $scope.journey = res[0];
            $scope.runList = res[1];
            if ($scope.journey.is_canceled ||
                !($rootScope.currentUser.role === 'admin' || $rootScope.currentUser.id === $scope.journey.UserId)) {
                $location.path('/journey');
            }
            $scope.journey.Run = $scope.runList[_.findIndex($scope.runList, 'id', $scope.journey.Run.id)];
            $scope.journeyTypeChange();
            $scope.parcoursModeList = [
                {code: 'aller-retour', name: 'Aller-Retour'},
                {code: 'aller', name: 'Aller'},
                {code: 'retour', name: 'Retour'} ];
            $scope.carTypeList = [
                {code: 'citadine', name: 'Citadine'},
                {code: 'berline', name: 'Berline'},
                {code: 'break', name: 'Break'},
                {code: 'monospace', name: 'Monospace'},
                {code: 'suv', name: '4x4, SUV'},
                {code: 'coupe', name: 'Coupé'},
                {code: 'cabriolet', name: 'Cabriolet'}
            ];
            $scope.journey.journey_type = $scope.parcoursModeList[_.findIndex($scope.parcoursModeList, 'code', $scope.journey.journey_type)].code;
            $scope.journey.car_type = $scope.carTypeList[_.findIndex($scope.carTypeList, 'code', $scope.journey.car_type)].code;
            $timeout( function() {
                GoogleMapApi.initMap('map_canvas');
                $('#clockpicker_outward').clockpicker();
                $('#clockpicker_return').clockpicker();
                $scope.selectDestination($scope.journey.Run);
                $scope.selectSource($scope.journey.address_start);
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
        });
        $scope.journeyTypeChange = function () {
            if ($scope.journey.journey_type ===  'aller-retour') {
                $scope.outward = true;
                $scope.return = true;
            } else if ($scope.journey.journey_type ===  'aller') {
                $scope.outward = true;
                $scope.return = false;
                $scope.journey.date_start_return = null;
                $scope.journey.time_start_return = null;
                $scope.journey.nb_space_return = null;
            } else if ($scope.journey.journey_type ===  'retour') {
                $scope.outward = false;
                $scope.return = true;
                $scope.journey.date_start_outward = null;
                $scope.journey.time_start_outward = null;
                $scope.journey.nb_space_outward = null;
            }
        };
        $scope.getLocation = function(val) {
            return GoogleMapApi.getLocation(val);
        };
        $scope.showMapInfo = function () {
            GoogleMapApi.resetDirection('map_canvas');
            GoogleMapApi.showDirection('map_canvas', $scope.source, $scope.destination);
            GoogleMapApi.getDistance($scope.source, $scope.destination).then(function (result) {
                $scope.journey.distance = result.distance;
                $scope.journey.duration = result.duration;
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
        $scope.submitJourney = function (journey) {
            var template = 'JourneyUpdated',
                values = {runName: journey.Run.name };
			console.log(journey);
            Journey.update(journey);
            Inbox.addMessage(template, values, $rootScope.currentUser.id);
            $location.path('/journey');
        };
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