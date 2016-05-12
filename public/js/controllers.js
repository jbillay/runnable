/**
 * Created by jeremy on 04/01/2014.
 */

/* Controllers */

/*jshint undef:true */
'use strict';

angular.module('runnable.controllers', []).
	controller('RunnableMainController', function ($scope, $rootScope, $q, $location, $window, USER_ROLES, AUTH_EVENTS,
												   AuthService, USER_MSG, User, Session, Inbox, Journey) {
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
		$scope.showLogin = function () {
			angular.element('#loginModal').modal('show');
		};
        $scope.logout = function () {
            AuthService.logout()
                .then(function (res) {
                    $window.location.reload();
                });
        };
		$scope.inviteFriend = function () {
			angular.element('#modalInviteFriends').modal('show');
		};
        $scope.login = function (credentials) {
            AuthService.login(credentials).then(function (user) {
                var unread = 0;
                angular.forEach(user.Inboxes, function (inbox) {
                    if (inbox.is_read === 0) {
                        unread = unread + 1;
                    }
                });
                $scope.setCurrentUser(user, unread);
                if ($rootScope.draftId) {
                    Journey.confirm($rootScope.draftId).then(function (journey) {
                        $location.path('/journey');
                    });
                } else if ($rootScope.checkout) {
                    $location.path('/checkout-' + $rootScope.checkout.journeyId);
                }
            });
            angular.element('#loginModal').modal('hide');
        };
        $scope.createUser = function (user) {
            $scope.userCreate = {};
            User.create(user).then(function (newUser) {
                var unread = 0;
                $scope.setCurrentUser(newUser, unread);
                if ($rootScope.draftId) {
                    Journey.confirm($rootScope.draftId).then(function (journey) {
                        $location.path('/journey');
                    });
                }
            });
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
	controller('RunnableConnectController', function ($scope, $rootScope, GoogleMapApi) {
        $scope.getLocation = function(val) {
            return GoogleMapApi.getLocation(val);
        };
    }).
	controller('RunnableCheckoutController', function ($scope, $rootScope, $q, $location, $sce, $routeParams, Journey,
                                                       Technical, MyRunTripFees, Join) {
        if ($rootScope.checkout) {
            $scope.selectedJourneyId = $rootScope.checkout.journeyId;
        } else  {
            if (!$rootScope.isAuthenticated) {
                $rootScope.checkout = {
                    journeyId: parseInt($routeParams.journeyId)
                };
                $location.path('/connect');
            } else {
                $scope.selectedJourneyId = $routeParams.journeyId;
            }
        }
        var journeyPromise = Journey.getDetail($scope.selectedJourneyId),
            feePromise = MyRunTripFees.getFee($scope.selectedJourneyId),
            versionPromise = Technical.version(),
            all = $q.all([journeyPromise, feePromise, versionPromise]);
        all.then(function (res) {
            $scope.journey = res[0];
            if ($scope.journey.is_canceled) {
                $location.path('/journey');
            }
            $scope.fees = res[1];
            $scope.version = res[2];
            if ($scope.version === 'DEV') {
                $scope.url_paypal = $sce.trustAsResourceUrl('https://www.sandbox.paypal.com/cgi-bin/webscr');
                $scope.key_paypal = '622WFSZHPNBH4';
                $scope.url_website = 'https://myruntrip-staging.herokuapp.com';
            } else {
                $scope.url_paypal = $sce.trustAsResourceUrl('https://www.paypal.com/cgi-bin/webscr');
                $scope.key_paypal = 'ST4SRXB6PJAGC';
                $scope.url_website = 'http://www.myruntrip.com';
            }
            $scope.reserved_outward = 0;
            $scope.reserved_return = 0;
            $scope.discount = 0;
            $scope.discountOld = 0;
            if ($scope.fees.discount) {
                $scope.discount = _.toNumber($scope.fees.discount * 100);
                $scope.discountLabel = _.toString($scope.discount) + ' %';
            }
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
            $scope.selectedPlaceOutward = 0;
            $scope.selectedPlaceReturn = 0;

            var invoice_key = Math.random().toString(36).substring(2, 7).toUpperCase();
            var d = new Date();
            var curr_date = ('0' + d.getDate()).slice(-2);
            var curr_month = ('0' + (d.getMonth() + 1)).slice(-2);
            var curr_year = d.getFullYear();
            var invoice_date = curr_year + '' + curr_month + '' + curr_date;
            $scope.invoice_ref = 'MRT' + invoice_date + invoice_key;

            $scope.promoCode = {
                promoCodeValid: 0,
                discount: 0,
                code: '',
                codeError: 0,
                codeErrorMsg: ''
            };

            $scope.journeyPrice = {
                outwardAmount: 0,
                returnAmount: 0,
                fees: 0,
                totalAmount: 0
            };

            $scope.calculatePrices = function () {
                var feeBySpace = MyRunTripFees.calculateFee($scope.journey.amount, $scope.discount);

                $scope.journeyPrice.fees = 0;
                if ($scope.selectedPlaceOutward) {
                    $scope.journeyPrice.outwardAmount = $scope.journey.amount * $scope.selectedPlaceOutward;
                    $scope.journeyPrice.fees += $scope.selectedPlaceOutward * feeBySpace;
                }
                if ($scope.selectedPlaceReturn) {
                    $scope.journeyPrice.returnAmount = $scope.journey.amount * $scope.selectedPlaceReturn;
                    $scope.journeyPrice.fees += $scope.selectedPlaceReturn * feeBySpace;
                }
                $scope.journeyPrice.totalAmount = ($scope.journeyPrice.outwardAmount +
                                                    $scope.journeyPrice.returnAmount +
                                                    $scope.journeyPrice.fees).toFixed(2);
                $scope.journeyPrice.fees = $scope.journeyPrice.fees.toFixed(2);
                return $scope.journeyPrice;
            };

            $scope.joinJourney = function (placeOutward, placeReturn, form) {
                var prices = $scope.calculatePrices(),
                    amount = prices.totalAmount,
                    fees = prices.fees;
                placeOutward = placeOutward  || 0;
                placeReturn = placeReturn  || 0;
                $scope.joined = 1;
                $scope.reserved_outward = $scope.reserved_outward + placeOutward;
                $scope.reserved_return = $scope.reserved_return + placeReturn;
                Join.add($scope.journeyId, placeOutward, placeReturn, amount, fees, $scope.invoice_ref)
                    .then(function (join) {
                        form.commit();
                    });
            };

            $scope.resetPromoCode = function () {
                $scope.discount = $scope.discountOld;
                $scope.discountLabel = _.toString($scope.discount) + ' %';
                $scope.calculatePrices();
                $scope.promoCode.promoCodeValid = 0;
                $scope.promoCode.discount = 0;
                $scope.promoCode.codeError = 0;
                $scope.promoCode.codeErrorMsg = '';
            };
            
            $scope.checkPromoCode = function () {
                $scope.promoCode.promoCodeValid = 0;
                $scope.promoCode.codeError = 0;
                $scope.promoCode.codeErrorMsg = '';
                if ($scope.promoCode.code.length) {
                    MyRunTripFees.checkCode(_.toString($scope.promoCode.code))
                        .then(function (code) {
                            if (code.id) {
                                $scope.promoCode.promoCodeValid = 1;
                                $scope.promoCode.discount = code.discount * 100;
                                if ($scope.discount < $scope.promoCode.discount) {
                                    $scope.discountOld = $scope.discount;
                                    $scope.discount = $scope.promoCode.discount;
                                }
                                $scope.discountLabel = _.toString($scope.discount) + ' %';
                                $scope.calculatePrices();
                            } else {
                                $scope.promoCode.promoCodeValid = 0;
                                $scope.promoCode.codeError = 1;
                                $scope.promoCode.codeErrorMsg = 'Désolé mais votre code n\'existe pas ou n\'est plus valide.';
                            }
                        })
                        .catch(function (err) {
                            $scope.promoCode.promoCodeValid = 0;
                            $scope.promoCode.codeError = 1;
                            $scope.promoCode.codeErrorMsg = 'En raison d\'un problème nous pouvons pas vérifier votre code';
                        });
                }
            };
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
        $scope.forLogin = true;
        $scope.forReset = false;
        $scope.credentials = {
			username: '',
			password: ''
		};
		$scope.reset = function (email) {
			AuthService.reset(email);
			angular.element('#loginModal').modal('hide');
		};
        $scope.toggleLogin = function () {
            if ($scope.forLogin === true) {
                $scope.forLogin = false;
                $scope.forReset = true;
            } else {
                $scope.forLogin = true;
                $scope.forReset = false;
            }
        };
	}).
	controller('RunnableIndexController', function ($scope, $q, $timeout, Run, Journey, GoogleMapApi, Email,
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
        $scope.sendContact = function (contact) {
            var data = {};
            $scope.mailContact = {};
            data.emails = 'contact@myruntrip.com';
            data.title = '[My Run Trip] Demande info : ' + contact.demande;
            data.message = 'Information concernant' + contact.demande + '<br>' +
                            'De la part de : ' + contact.email + '<br>' +
                            'Content : <br>' + contact.content + '<br>';
            data.confirm = 'infoRequestReceived';
            Email.send(data);
        };
	}).
	controller('RunnableProfileController', function ($scope, $q, $rootScope, $location, $timeout, $sce, User, BankAccount,
                                                      fileReader, Upload) {
		$scope.page = 'Profile';
        $scope.errFile = null;
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

        $scope.uploadFiles = function(file, errFiles) {
            $scope.errFile = errFiles && errFiles[0];
            if (file) {
                $scope.getFile(file);
                file.upload = Upload.upload({
                    url: '/api/user/picture',
                    data: {file: file}
                });

                file.upload.then(function (response) {
                    $timeout(function () {
                        file.result = response.data;
                    });
                }, function (response) {
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                });
            }
        };

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
			BankAccount.save(bankAccountInfo);
		};
        $scope.getFile = function (file) {
            fileReader.readAsDataUrl(file, $scope)
                .then(function(result) {
                    $scope.file = file;
                    $scope.imageSrc = result;
                    $scope.errFile = null;
                });
        };
        $scope.deleteFile = function () {
            $scope.imageSrc = null;
            $scope.errFile = null;
            fileReader.deletePicture($scope.file);
        };
    }).
	controller('RunnableAdminController', function ($scope, $q, $rootScope, $location, AuthService, User, Run, Partner,
                                                    Journey, Join, EmailOptions, BankAccount, Page, Inbox, Technical,
                                                    Invoice, MyRunTripFees, uiGridConstants) {
		$scope.page = 'Admin';
		var userListPromise = User.getList(),
			runListPromise = Run.getList(),
			journeyListPromise = Journey.getList(),
			journeyToPayPromise = Journey.toPay(),
			joinListPromise = Join.getList(),
			EmailOptionsPromise = EmailOptions.get(),
			pageListPromise = Page.getList(),
            versionPromise = Technical.version(),
			partnerListPromise = Partner.getList(),
            feeDefaultPromise = MyRunTripFees.getDefault(),
            feeListPromise = MyRunTripFees.getFeeList(),
			all = $q.all([userListPromise, runListPromise, journeyListPromise, joinListPromise, EmailOptionsPromise,
                pageListPromise, versionPromise, partnerListPromise, journeyToPayPromise, feeDefaultPromise,
                feeListPromise]);
		all.then(function (res) {
			$scope.userList = res[0];
			$scope.runList = res[1];
			$scope.journeyList = res[2];
			$scope.joinList = res[3];
			$scope.emailOption = res[4];
			$scope.pageList = res[5];
            $scope.version = res[6];
            $scope.partnersList = res[7];
            $scope.journeyToPay = res[8];
            $scope.defaultFee = res[9];
            $scope.feeList = res[10];
            if ($scope.defaultFee.percentage) {
                $scope.defaultFee.percentage = $scope.defaultFee.percentage * 100;
            }
            angular.forEach($scope.journeyToPay, function (journey) {
                var dates=[];
                dates.push(new Date(journey.date_start_outward));
                dates.push(new Date(journey.date_start_return));
                journey.dateToPay = moment(new Date(Math.max.apply(null, dates))).fromNow();
                journey.nbJourney = 0;
                journey.nbValidatedJourney = 0;
                angular.forEach(journey.Joins, function (join) {
                    journey.amountToPay = parseFloat(join.Invoice.amount) - parseFloat(join.Invoice.fees);
                    join.validated = false;
                    join.User = $scope.userList[_.findIndex($scope.userList, {'id': parseInt(join.UserId)})];
                    if (join.ValidationJourney) {
                        join.validated = true;
                    }
                    if (join.Invoice) {
                        journey.nbJourney++;
                    }
                    if (join.ValidationJourney) {
                        journey.nbValidatedJourney++;
                    }
                });
            });
            $scope.codeGridOptions.data = $scope.feeList.code;
            $scope.feesGridOptions.data = $scope.feeList.fees;
            $scope.userNameList = _.map($scope.userList, function (user) {
                var name = user.firstname + ' ' + user.lastname;
                return {id: user.id, email: user.email, name: name};
            });
            if (!$rootScope.isAdmin) {
                $location.path('/');
            }
		});
		$scope.createPageForm = {
			'newPageName'     : ''};
		$scope.originForm = angular.copy($scope.createPageForm);
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
        $scope.joinSearch = {
            pending: false,
            completed: true,
            cancelled: false
        };
        $scope.userToggleActive = function(user) {
			User.userToggleActive(user.id);
			if (user.isActive) {
				user.isActive = false;
			} else {
				user.isActive = true;
			}
		};
        // Join
        $scope.forceComplete = function (join) {
            Invoice.complete(join.Invoice.amount, join.Invoice.ref)
                .then(function(res) {
                    $rootScope.$broadcast('USER_MSG', {msg: 'forceCompleteSuccess', type: 'success'});
                })
                .catch(function (err) {
                    $rootScope.$broadcast('USER_MSG', {msg: 'forceCompleteFailed', type: 'error'});
                });
        };
        // Email options
        $scope.createTemplateEmail = false;
        $scope.switchEmailTemplate = function () {
            $scope.createTemplateEmail = $scope.createTemplateEmail ? false : true;
        };
        $scope.addTemplateEmail = function (templateInfo) {
            var newTemplate = {
                id: $scope.emailOption.emailTemplate.length,
                name: templateInfo.name,
                key: [templateInfo.keys],
                title: 'TBD',
                html: 'TBD'
            };
            $scope.emailOption.emailTemplate.push(newTemplate);
            $scope.switchEmailTemplate();
        };
		$scope.submitEmailOptions = function (mailConfig) {
			EmailOptions.save(mailConfig);
		};

        // Margin options
        $scope.saveDefaultFee = function (fees) {
            var newDefaultFee = angular.copy(fees);
            if (_.toNumber(newDefaultFee.percentage) !== 0) {
                newDefaultFee.percentage = _.toNumber(newDefaultFee.percentage) / 100;
            }
            if (newDefaultFee.value) {
                newDefaultFee.value = _.toNumber(newDefaultFee.value);
            }
            MyRunTripFees.update(newDefaultFee);
        };

        // Page options
		$scope.editPage = function (page) {
			$scope.editedPage = page;
			angular.element('#adminEditPageModal').modal('show');
		};
		$scope.journeyCancel = function (journey) {
			journey.is_canceled = true;
			Journey.cancel(journey.id);
		};
		$scope.exportUsers = function () {
			var blob = new Blob([document.getElementById('usertab').innerHTML], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
			});
			saveAs(blob, 'ExportUsers.xls');
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
			$scope.userEdited = user;
			angular.element('#userEditModal').modal('show');
		};
		$scope.userSave = function (user) {
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
			Run.toggleActive(run.id);
			if (run.is_active) {
				run.is_active = false;
			} else {
				run.is_active = true;
			}
		};
        $scope.openJourneyAction = function (journey, idx) {
            $scope.selectedJourney = journey;
            $scope.selectedJourney.idx = idx;
            var userRIBPromise = BankAccount.getByUser(journey.User.id),
                all = $q.all([userRIBPromise]);
            all.then(function (res) {
                $scope.selectedJourneyUserRIB = res[0];
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
            if ($scope.selectedJourney.is_payed === true) {
                $scope.journeyToPay.splice($scope.selectedJourney.idx, 1);
            }
            angular.element('#adminJourneyAction').modal('hide');
        };
        // Partner scope
        $scope.partnerCreation = false;
        $scope.switchPartner = function () {
            $scope.partnerCreation = $scope.partnerCreation ? false : true;
        };

        $scope.createPartner = function (partner) {
            var cleanPartner = {
                name: partner.name,
                expiry: partner.expiry,
                fee: partner.fee,
                user: partner.user.id
            };
            Partner.create(cleanPartner).then(function (newPartner) {
                $scope.partnersList.push(newPartner);
                $scope.switchPartner();
            });
        };

        $scope.sendInfoPartner = function (partnerId) {
            Partner.sendInfo(partnerId);
        };

        // Margin and code section
        $scope.feesCreation = false;
        $scope.switchFeesCreation = function () {
            $scope.feesCreation = $scope.feesCreation ? false : true;
        };

        $scope.feesGridOptions = {
            enableFiltering: true,
            showGridFooter: true,
            columnDefs: [
                { name:'id', field: 'id', enableCellEdit: false, type: 'number', width: '5%' },
                {
                    name:'Pourcentage',
                    field: 'percentage',
                    cellFilter: 'showInPercentage',
                    enableHiding: false,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    width: '15%'
                },
                { name:'Frais Fixe', field: 'value', type: 'number', width: '10%' },
                {
                    name:'Réduction',
                    field: 'discount',
                    cellFilter: 'showInPercentage',
                    enableHiding: false,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    width: '14%'
                },
                { name:'Début', field: 'start_date', type: 'date', cellFilter: 'showInfinite | date', width: '14%' },
                { name:'Fin', field: 'end_date', type: 'date', cellFilter: 'showInfinite | date', width: '14%' },
                { name:'Course', field: 'Run', enableCellEdit: false, cellFilter: 'showRun', width: '14%' },
                { name:'User', field: 'User', enableCellEdit: false, cellFilter: 'showUser', width: '14%' }
            ]
        };

        $scope.feesGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $scope.updateFees(rowEntity.id, colDef.field, oldValue, newValue);
                $scope.$apply();
            });
        };

        $scope.updateFees = function (id, field, oldValue, newValue) {
            if (oldValue !== newValue) {
                var idx = _.findIndex($scope.feeList.fees, ['id', id]);
                $scope.feeList.code[idx].field = newValue;
                MyRunTripFees.update($scope.feeList.fees[idx])
                    .then(function (newFee) {
                        if (newFee.UserId) {
                            newFee.User = $scope.userList[_.findIndex($scope.userList, {'id': parseInt(newFee.UserId)})];
                        }
                        if (newFee.RunId) {
                            newFee.Run = $scope.runList[_.findIndex($scope.runList, {'id': parseInt(newFee.RunId)})];
                        }
                        $scope.feeList.fees.splice(idx, 1);
                        $scope.feeList.fees.push(newFee);
                    });
            }
        };

        $scope.createFee = function (fee) {
            var cleanFee= {
                percentage: fee.percentage / 100 || null,
                value: fee.value || null,
                discount: fee.discount / 100 || null,
                start_date: fee.start_date || new Date(),
                end_date: fee.end_date || null,
                UserId: null,
                RunId: null
            };
            if (fee.user) {
                cleanFee.UserId = fee.user.id;
            }
            if (fee.run) {
                cleanFee.RunId = fee.run.id;
            }
            MyRunTripFees.create(cleanFee)
                .then(function (newFee) {
                    if (newFee.UserId) {
                        newFee.User = $scope.userList[_.findIndex($scope.userList, {'id': parseInt(newFee.UserId)})];
                    }
                    if (newFee.RunId) {
                        newFee.Run = $scope.runList[_.findIndex($scope.runList, {'id': parseInt(newFee.RunId)})];
                    }
                    $scope.feeList.fees.push(newFee);
                    $scope.newFee = {};
                });
        };

        $scope.codeCreation = false;
        $scope.switchCodeCreation = function () {
            $scope.codeCreation = $scope.codeCreation ? false : true;
        };

        $scope.codeGridOptions = {
            enableFiltering: true,
            showGridFooter: true,
            columnDefs: [
                { name:'id', field: 'id', enableCellEdit: false, type: 'number', width: '5%' },
                { name:'Code', field: 'code', enableHiding: false, width: '17%' },
                {
                    name:'Réduction',
                    field: 'discount',
                    cellFilter: 'showInPercentage',
                    enableHiding: false,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    width: '9%'
                },
                { name:'Restant', field: 'remaining', type: 'number', cellFilter: 'showInfinite', width: '5%' },
                { name:'Début', field: 'start_date', type: 'date', cellFilter: 'showInfinite | date', width: '17%' },
                { name:'Fin', field: 'end_date', type: 'date', cellFilter: 'showInfinite | date', width: '17%' },
                { name:'Course', field: 'Run', enableCellEdit: false, cellFilter: 'showRun', width: '15%' },
                { name:'User', field: 'User', enableCellEdit: false, cellFilter: 'showUser', width: '15%' }
            ]
        };

        $scope.codeGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $scope.updateCode(rowEntity.id, colDef.field, oldValue, newValue);
                $scope.$apply();
            });
        };

        $scope.updateCode = function (id, field, oldValue, newValue) {
            if (oldValue !== newValue) {
                var idx = _.findIndex($scope.feeList.code, ['id', id]);
                $scope.feeList.code[idx].field = newValue;
                MyRunTripFees.update($scope.feeList.code[idx])
                    .then(function (newFee) {
                        if (newFee.UserId) {
                            newFee.User = $scope.userList[_.findIndex($scope.userList, {'id': parseInt(newFee.UserId)})];
                        }
                        if (newFee.RunId) {
                            newFee.Run = $scope.runList[_.findIndex($scope.runList, {'id': parseInt(newFee.RunId)})];
                        }
                        $scope.feeList.code.splice(idx, 1);
                        $scope.feeList.code.push(newFee);
                    });
            }
        };

        $scope.createCode = function (code) {
            var cleanCode = {
                code: code.code,
                discount: code.reduction / 100,
                remaining: code.remaining || null,
                start_date: code.start_date || new Date(),
                end_date: code.end_date || null,
                UserId: null,
                RunId: null
            };
            if (code.user) {
                cleanCode.UserId = code.user.id;
            }
            if (code.run) {
                cleanCode.RunId = code.run.id;
            }
            MyRunTripFees.create(cleanCode)
                .then(function (newFee) {
                    if (newFee.UserId) {
                        newFee.User = $scope.userList[_.findIndex($scope.userList, {'id': parseInt(newFee.UserId)})];
                    }
                    if (newFee.RunId) {
                        newFee.Run = $scope.runList[_.findIndex($scope.runList, {'id': parseInt(newFee.RunId)})];
                    }
                    $scope.feeList.code.push(newFee);
                    $scope.newCode = {};
                });
        };
	}).
    controller('RunnableRunDetailController', function ($scope, $q, $timeout, $routeParams, $location,
														Run, Journey, GoogleMapApi, Session, Participate) {
        $scope.page = 'Run';
		$scope.runId = $routeParams.runId;
        $scope.userJoined = false;
		var runPromise = Run.getDetail($scope.runId),
			journeyPromise = Journey.getListForRun($scope.runId),
            participatePromise = Participate.userRunList($scope.runId),
            allPublic = $q.all([runPromise, journeyPromise]),
            allPrivate = $q.all([participatePromise]);
        allPrivate.then(function (res) {
            $scope.participateList = res[0];
            $scope.nbJoiner = $scope.participateList.length;
            angular.forEach($scope.participateList, function (participate) {
                if (participate.UserId === Session.userId) {
                    $scope.userJoined = true;
                }
            });
        });
        allPublic.then(function (res) {
			$scope.run = res[0];
			$scope.journeyList = res[1];
            if ($scope.run.sticker === null && $scope.run.type === 'trail') {
                $scope.run.sticker = '/img/trail_default.jpg';
            } else if ($scope.run.sticker === null) {
                $scope.run.sticker = '/img/run_default.jpg';
            }
			$timeout( function() {
				var obj = 'map_canvas_run';
				GoogleMapApi.initMap(obj);
                GoogleMapApi.addMaker(obj, $scope.run.address_start,
                    'Départ de la course', 'Départ de la course',
                    'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=flag|FFFFFF');
				angular.forEach($scope.journeyList, function (journey) {
                    GoogleMapApi.addMaker(obj, journey.address_start,
                        null, null,
                        'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=car-dealer|35a5a2')
                        .then(function (markerId) {
                            journey.markerId = markerId;
                        });
				});
                $(document).scrollTop(0);
                $('#carousel-run-picture').carousel({ interval: 5000, cycle: true });
                var headerHeight = $('#journeyPanel').offset().top - 40;
                var footerHeight = $(document).height() - ($('#journeyPanel').outerHeight() + $('#journeyPanel').offset().top);
                if ($('#journeyPanel').outerHeight(true) >= 600)
                {
                    $('#MyAffix').affix({
                        offset: {
                            top: headerHeight,
                            bottom: footerHeight
                        }
                    }).on('affix.bs.affix', function () { // before affix
                        $(this).css({
                            'width': $(this).outerWidth()  // variable widths
                        });
                    }).on('affix-bottom.bs.affix', function () { // before affix-bottom
                        $(this).css('bottom', 'auto'); // THIS is what makes the jumping
                    });
                }
                $('.runDetailJourneyDetailPanel').on( {
                    'mouseenter':function() { $scope.toggleBounce(this.id); },
                    'mouseleave':function() { $scope.toggleBounce(this.id); }
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
        $scope.toggleBounce = function (id) {
            GoogleMapApi.toggleAnimation('map_canvas_run', id, 'BOUNCE',
                'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=car-dealer|35a5a2',
                'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=car-dealer|BC3790');
        };
		$scope.createJourney = function () {
            $location.path('/journey-create-' + $scope.runId);
		};
        $scope.participateRun = function () {
            if (!Session.userEmail) {
                $scope.showLogin();
            } else {
                Participate.add($scope.run.id)
                    .then(function (participe) {
                        $scope.participateList.push({RunId: $scope.run.id, UserId: Session.userId, id: null});
                        $scope.userJoined = true;
                    });
            }
        };
    }).
    controller('RunnableRunCreateController', function ($scope, $q, $timeout, $location, Run, GoogleMapApi,
                                                        fileReader, Upload) {
        $scope.page = 'Run';
        var maxImgByRace = 6;
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.listRun = res[0];
			$timeout( function() {
                $('#clockpicker').clockpicker();
                GoogleMapApi.initMap('map_canvas');
			});
		});
        $scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
		$scope.selectedAddress = function (address) {
			GoogleMapApi.selectedAddress('map_canvas', address);
		};
        $scope.newRun = {};
        $scope.newRun.type = 'trail';
        $scope.runListImg = [];
        $scope.today = new Date();
        $scope.calendar = {
            opened: false,
            dateFormat: 'dd/MM/yyyy',
            dateOptions: {
                formatYear: 'yy',
                startingDay: 1
            },
            open: function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.calendar.opened = true;
            }
        };
        $scope.uploadFile = function (file, errFiles) {
            $scope.errFile = errFiles && errFiles[0];
            if (file) {
                $scope.getFile(file);
            }
        };
        $scope.getFile = function (file) {
            fileReader.readAsDataUrl(file, $scope)
                .then(function(result) {
                    var img = {
                        name: file.name,
                        default: false,
                        src: result,
                        file: file
                    };
                    if ($scope.runListImg.length < maxImgByRace) {
                        if (_.findIndex($scope.runListImg, function (o) { return o.name === file.name; }) === -1) {
                            $scope.runListImg.push(img);
                            $scope.errFile = $scope.maxFile = null;
                        }
                    } else {
                        $scope.maxFile = 1;
                    }
                });
        };
        $scope.removePicture = function (idx) {
            $scope.runListImg.splice(idx, 1);
        };
        $scope.defaultImg = function (idx) {
            var iterator = 0;
            angular.forEach($scope.runListImg, function (img) {
                if (iterator === idx) {
                    img.default = true;
                } else {
                    img.default = false;
                }
                iterator++;
            });
        };
        $scope.submitRun = function (form, newRun) {
            if (form.$valid) {
                $('body').addClass('loading');
                var runForm = new FormData(),
                    fileInfo = [];
                angular.forEach($scope.runListImg, function (image) {
                    runForm.append('file', image.file);
                    if (image.default) {
                        fileInfo.push(true);
                    } else {
                        fileInfo.push(false);
                    }
                });
                runForm.append('fileInfo', fileInfo);
                runForm.append('name', newRun.name);
                runForm.append('type', newRun.type);
                runForm.append('address_start', newRun.address_start);
                runForm.append('date_start', newRun.date_start);
                runForm.append('time_start', newRun.time_start);
                runForm.append('distances', newRun.distances);
                runForm.append('elevations', newRun.elevations);
                runForm.append('info', newRun.info);
                Run.create(runForm).then(function () {
                    $('body').removeClass('loading');
                    $location.path('/run');
                });
            }
        };
    }).
    controller('RunnableRunUpdateController', function ($scope, $q, $timeout, $routeParams, $rootScope, $location,
                                                        Run, GoogleMapApi) {
        $scope.page = 'Run';
        $scope.runId = parseInt($routeParams.runId);
		var runPromise = Run.getDetail($scope.runId),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.currentRun = res[0];
            if (!$rootScope.currentUser &&
                !($rootScope.currentUser.role === 'admin' || $rootScope.currentUser.id === $scope.currentRun.UserId)) {
                $location.path('/run');
            }
            $timeout( function() {
                $('#clockpicker').clockpicker();
                GoogleMapApi.initMap('map_canvas');
                GoogleMapApi.selectedAddress('map_canvas', $scope.currentRun.address_start);
			});
		});
        $scope.getLocation = function(val) {
			return GoogleMapApi.getLocation(val);
		};
		$scope.selectedAddress = function (address) {
			GoogleMapApi.selectedAddress('map_canvas', address);
		};
        $scope.today = new Date();
        $scope.calendar = {
            opened: false,
            dateFormat: 'dd/MM/yyyy',
            dateOptions: {
                formatYear: 'yy',
                startingDay: 1
            },
            open: function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.calendar.opened = true;
            }
        };
        $scope.submitRun = function (form, updatedRun) {
            if (form.$valid) {
                $('body').addClass('loading');
                Run.update(updatedRun).then(function () {
                    $('body').removeClass('loading');
                    $location.path('/run');
                });
            }
        };
    }).
    controller('RunnableRunController', function ($scope, $q, Run, $timeout, GoogleMapApi, Email, DEFAULT_DISTANCE) {
        $scope.page = 'Run';
		$scope.default_distance = DEFAULT_DISTANCE;
		$scope.searchForm = {
				run_adv_type: '',
				run_adv_start_date: null,
				run_adv_end_date: null,
				run_adv_city: null,
				run_adv_distance: DEFAULT_DISTANCE
			};
		$scope.run_name = '';
		var cleanForm = angular.copy($scope.searchForm);
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
		$scope.resetSearch = function () {
			$scope.advancedSearch = 0;
			$scope.run_name = '';
			$scope.searchForm = angular.copy(cleanForm);
			Run.search().then(function(runs) {
                $scope.listRun = runs;
            });
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
        $scope.openRunProposal = function () {
            angular.element('#runProposalModal').modal('show');
        };
        $scope.cancelRunProposal = function () {
            angular.element('#runProposalModal').modal('hide');
        };
        $scope.submitRunProposal = function (form) {
            angular.element('#runProposalModal').modal('hide');
            var data = {};
            data.emails = 'contact@myruntrip.com';
            data.title = '[My Run Trip] Création course : ' + form.runName;
            data.message = 'Le user ' + form.runEmail + '<br>' +
                'Propose de créer la course : ' + form.runName + '<br>' +
                'De type :' + form.runType + '<br>' +
                'Ayant lieu le :' + form.runDate + '<br>' +
                'Site de la course :' + form.runLink + '<br>';
            data.confirm = 'runRequestReceived';
            Email.send(data);
        };
    }).
	controller('RunnableJourneyDetailController', function ($scope, $q, $routeParams, $rootScope, $timeout, $location,
															$sce, Run, Journey, Join, GoogleMapApi, MyRunTripFees,
                                                            Session, Inbox, Technical, Discussion) {
		$scope.page = 'Journey';
		$scope.journeyId = parseInt($routeParams.journeyId);
		var journeyPromise = Journey.getDetail($scope.journeyId),
			joinPromise = Join.getListForJourney($scope.journeyId),
			publicMessagesPromise = Discussion.getPublicMessages($scope.journeyId, 1),
			all = $q.all([journeyPromise, joinPromise, publicMessagesPromise]);
		all.then(function (res) {
			$scope.journey = res[0];
            if ($scope.journey.is_canceled) {
                $location.path('/journey');
            }
			$scope.joinList = res[1];
            $scope.publicMessages = res[2];
			$scope.joined = 0;
			$scope.reserved_outward = 0;
			$scope.reserved_return = 0;
            $scope.messageFilter = false;

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
            angular.forEach($scope.publicMessages, function (message) {
                message.showDate = moment(message.createdAt).fromNow();
            });
			$timeout( function() {
				var obj = 'map_canvas';
				GoogleMapApi.initMap(obj);
				GoogleMapApi.showDirection(obj, $scope.journey.address_start, $scope.journey.Run.address_start);
                $('[data-toggle="tooltip"]').tooltip();
                $(document).scrollTop(0);
			});
			$scope.nbFreeSpaceOutward = function () {
                if ($scope.journey.nb_space_outward === null) {
                    return 0;
                }
				return parseInt($scope.journey.nb_space_outward) - parseInt($scope.reserved_outward);
			};
			$scope.nbFreeSpaceReturn = function () {
                if ($scope.journey.nb_space_return === null) {
                    return 0;
                }
				return parseInt($scope.journey.nb_space_return) - parseInt($scope.reserved_return);
			};
			$scope.nbFreeSpace = function () {
				return $scope.nbFreeSpaceOutward() + $scope.nbFreeSpaceReturn();
			};
		});
		$scope.startCheckout = function () {
            $rootScope.checkout = {
                journeyId: $scope.journey.id
            };
            if (!$rootScope.isAuthenticated) {
                $location.path('/connect');
            } else {
                $location.path('/checkout-' + $scope.journey.id);
            }
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
			var placeOutwardReturn = 0,
				placeReturnReturn = 0;
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
		};
        $scope.resetFilterMsg = function () {
            $scope.messageFilter = false;
        };
        $scope.checkEmailPhone = function (text) {
            if (text.match(/[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?/gi) !== null) {
                return true;
            } else if (text.match(/((\+|00)33\s?|0)[679]([\s\.\-]?\d{2}){4}/gi) !== null) {
                return true;
            }
            return false;
        };
		$scope.sendMessage = function (discussion) {
            if (discussion && discussion.newMessageEntry) {
                var text = String(discussion.newMessageEntry).replace(/<[^>]+>/gm, ''),
                    email = discussion.userEmailEntry || null;
                discussion.newMessageEntry = '';
                discussion.userEmailEntry = '';
                if (text.length && !$scope.checkEmailPhone(text)) {
                    $scope.publicMessages.unshift(
                        {	message: text,
                            showDate: moment(Date.now()).fromNow(),
                            createdAt: Date.now()
                        });
                    Discussion.addPublicMessage(text, $scope.journeyId, email);
                } else if ($scope.checkEmailPhone(text)) {
                    $scope.messageFilter = $scope.checkEmailPhone(text);
                }
            }
		};
	}).
	controller('RunnableJourneyCreateController', function ($scope, $q, $timeout, $routeParams, $rootScope, $location,
                                                            Journey, Run, GoogleMapApi, Session, $facebook) {
        $scope.page = 'Journey';
        if (!Session.userEmail) {
            $scope.isConnected = false;
        } else {
            $scope.isConnected = true;
        }
		var runPromise = Run.getActiveList(),
            all = $q.all([runPromise]);
        all.then(function (res) {
			$scope.runList = res[0];
			$scope.outward = true;
			$scope.return = true;
            $scope.publishFacebook = true;
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
                $('[data-toggle="tooltip"]').tooltip();
                $(document).scrollTop(0);
            });
            if ($routeParams.runId) {
                $scope.journey.Run = $scope.runList[_.findIndex($scope.runList, {'id': parseInt($routeParams.runId)})];
                $scope.selectDestination($scope.journey.Run);
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
                $timeout( function() {
                    $('#clockpicker_outward').clockpicker();
                    $('#clockpicker_return').clockpicker();
                });
            } else if ($scope.journey.journey_type ===  'aller') {
				$scope.outward = true;
                $scope.return = false;
                $scope.journey.date_start_return = null;
                $scope.journey.time_start_return = null;
                $scope.journey.nb_space_return = null;
                $timeout( function() {
                    $('#clockpicker_outward').clockpicker();
                });
			} else if ($scope.journey.journey_type ===  'retour') {
				$scope.outward = false;
				$scope.return = true;
                $scope.journey.date_start_outward = null;
                $scope.journey.time_start_outward = null;
                $scope.journey.nb_space_outward = null;
                $timeout( function() {
                    $('#clockpicker_return').clockpicker();
                });
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
            var fb_titre = 'Mon voyage pour la course ' + journey.Run.name,
                fb_desc = 'Je vous propose un ' + journey.journey_type + ' au départ de ' + journey.address_start;
            Journey.create(journey).then(function (newJourney) {
                if (!$rootScope.isAuthenticated) {
                    $rootScope.draftId = newJourney;
                    $location.path('/connect');
                } else {
                    if ($scope.publishFacebook) {
                        var fb_link = 'http://www.myruntrip.com/journey-' + newJourney.id;
                        $facebook.ui({
                            method: 'feed',
                            link: fb_link,
                            caption: 'My Run Trip',
                            picture: 'http://www.myruntrip.com/img/myruntrip_100.jpg',
                            name: fb_titre,
                            description: fb_desc
                        }, function(response){});
                    }
                    $location.path('/journey');
                }
            });
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
                if (join.ValidationJourney) {
                    if (join.ValidationJourney.UserId === Session.userId) {
                        join.validated = true;
                    }
                }
                // Define max date to show validation form
                if (join.Journey.date_start_return > join.Journey.date_start_outward) {
                    var dsr = join.Journey.date_start_return.split(/[- :T.]/);
                    join.Journey.date_max = new Date(dsr[0], dsr[1]-1, dsr[2], dsr[3], dsr[4], dsr[5]).getTime();
                } else {
                    var dso = join.Journey.date_start_outward.split(/[- :T.]/);
                    join.Journey.date_max = new Date(dso[0], dso[1]-1, dso[2], dso[3], dso[4], dso[5]).getTime();
                }
			});
            $(document).scrollTop(0);
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
                                                validation.rate_service)
                    .then(function (msg) {
                        join.validated = true;
                    });
            };
        };
		$scope.showJourneyModal = function (journey, join) {
			var discussionUsersPromise = Discussion.getUsers(journey.id),
				discussionMessagesPromise = Discussion.getPrivateMessages(journey.id, 0),
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
            $scope.userJourney.splice($scope.indexToBeRemoved, 1);
            Journey.cancel($scope.cancelJourney.id);
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
            $scope.userJoin.splice($scope.indexToBeRemoved, 1);
            Join.cancel($scope.cancelJoin.id);
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
			Discussion.addPrivateMessage(text, $scope.selectedJourney.id);
		};
	}).
	controller('RunnableUserPublicProfileController', function ($scope, $q, $routeParams, User) {
		$scope.userId = $routeParams.userId;
		var userPromise = User.getPublicInfo($scope.userId),
			userDriverPromise = User.getPublicDriverInfo($scope.userId),
			all = $q.all([userPromise, userDriverPromise]);
		all.then(function (res) {
			$scope.userPublicInfo = res[0];
			$scope.userDriverPublicInfo = res[1];
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
                ca = $scope.userPublicInfo.createdAt.split(/[- :T.]/),
				creation = new Date(ca[0], ca[1]-1, ca[2], ca[3], ca[4], ca[5]).getTime();
			$scope.sinceCreation = parseInt((now-creation)/(24*3600*1000)) + 1;
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
            $scope.journey.Run = $scope.runList[_.findIndex($scope.runList, {'id': $scope.journey.Run.id})];
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
            $scope.journey.journey_type = $scope.parcoursModeList[_.findIndex($scope.parcoursModeList, {'code': $scope.journey.journey_type})].code;
            $scope.journey.car_type = $scope.carTypeList[_.findIndex($scope.carTypeList, {'code': $scope.journey.car_type})].code;
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
                $timeout( function() {
                    $('#clockpicker_outward').clockpicker();
                    $('#clockpicker_return').clockpicker();
                });
            } else if ($scope.journey.journey_type ===  'aller') {
                $scope.outward = true;
                $scope.return = false;
                $timeout( function() {
                    $('#clockpicker_outward').clockpicker();
                });
            } else if ($scope.journey.journey_type ===  'retour') {
                $scope.outward = false;
                $scope.return = true;
                $timeout( function() {
                    $('#clockpicker_return').clockpicker();
                });
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
            if (journey.journey_type === 'aller') {
                journey.date_start_return = null;
                journey.time_start_return = null;
                journey.nb_space_return = null;
            } else if (journey.journey_type === 'retour') {
                journey.date_start_outward = null;
                journey.time_start_outward = null;
                journey.nb_space_outward = null;
            }
            Journey.update(journey)
                .then(function (msg) {
                    $location.path('/journey');
                });
        };
	}).
	controller('RunnableJourneyController', function ($scope, $q, $timeout, $location, Run, Journey, GoogleMapApi) {
        $scope.page = 'Journey';
        $scope.displayModeIcon = 'fa-list';
        $scope.displayMode = 'list';
        var journeyPromise = Journey.getOpenList(),
            all = $q.all([journeyPromise]);
        all.then(function (res) {
			$scope.journeyList = res[0];
			$timeout( function() {
                var journeysMap = 'map_canvas_journeys';
                GoogleMapApi.initMap(journeysMap);
				angular.forEach($scope.journeyList, function (journey) {
					var value = 'map_canvas_' + journey.id,
                        title = 'Départ pour la course ' + journey.Run.name,
                        info = '<div id="content"><div id="siteNotice"></div>'+
                            '<a href="/journey-' + journey.id + '">' +
                            '<h4 id="firstHeading" class="firstHeading">Départ pour la course ' +
                            journey.Run.name + '</h4></a>' + '<div id="bodyContent">' +
                            '<p><i class="fa fa-exchange"></i> ' + journey.journey_type +  '</p>';

                    if (journey.date_start_outward) {
                        var dateStart = new Date(journey.date_start_outward);
                        info = info + '<p><i class="fa fa-calendar"></i> Aller : ' +
                            dateStart.toLocaleDateString() + ' ' +
                            journey.time_start_outward + '</p>';
                    }
                    if (journey.date_start_return) {
                        var dateReturn = new Date(journey.date_start_return);
                        info = info + '<p><i class="fa fa-calendar"></i> Retour : ' +
                            dateReturn.toLocaleDateString() + ' ' +
                            journey.time_start_return + '</p>';
                    }
                    info = info + '<p><i class="fa fa-arrows-h"></i> ' + journey.distance + '</p>' +
                        '<p><i class="fa fa-history"></i> ' + journey.duration + '</p>' +
                        '<p><i class="fa fa-car"></i> ' + journey.car_type + '</p>'+
                        '<p><i class="fa fa-eur"></i> <strong>' + journey.amount + '</strong></p></div></div>';
					if (journey.date_start_outward) {
						journey.startDate = journey.date_start_outward;
					} else {
						journey.startDate = journey.date_start_return;
					}
					GoogleMapApi.initMap(value);
					GoogleMapApi.showDirection(value, journey.address_start, journey.Run.address_start);
                    GoogleMapApi.addMaker(journeysMap, journey.address_start, title, info);
				});
			});
		});
        $scope.switchDisplayMode = function () {
            if ($scope.displayModeIcon === 'fa-list') {
                $scope.displayModeIcon = 'fa-globe';
            } else {
                $scope.displayModeIcon = 'fa-list';
            }
        };
        $scope.switchDisplay = function () {
            if ($scope.displayMode === 'list') {
                $scope.displayMode = 'map';
                $scope.displayModeIcon = 'fa-list';
                $timeout( function() {
                    GoogleMapApi.refresh('map_canvas_journeys');
                });
            } else {
                $scope.displayMode = 'list';
                $scope.displayModeIcon = 'fa-globe';
            }
        };
        $scope.createJourney = function () {
            $location.path('/journey-create');
        };
});