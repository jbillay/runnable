'use strict';

/* jasmine specs for controllers go here */
describe('Runnable Controllers', function() {

    beforeEach(module('runnable'));
    beforeEach(module('runnable.services'));

    describe('RunnableMainController', function(){
        var scope, rootScope, ctrl, $httpBackend, AUTH_EVENTS, USER_ROLES, USER_MSG;

        beforeEach(inject(function(_$httpBackend_, _$rootScope_, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            spyOn(rootScope, '$broadcast').and.callThrough();
            AUTH_EVENTS = {
                loginSuccess: 'auth-login-success',
                loginFailed: 'auth-login-failed',
                logoutSuccess: 'auth-logout-success',
                sessionTimeout: 'auth-session-timeout',
                notAuthenticated: 'auth-not-authenticated',
                notAuthorized: 'auth-not-authorized'
            };
            USER_ROLES = {
                all: '*',
                admin: 'admin',
                editor: 'editor',
                user: 'user'
            };
            USER_MSG = {
                passwordReseted:	    'Un nouveau mot de passe vient de vous être envoyé',
                passwordUpdated:	    'Votre mot de passe a été mis à jour',
                userAuthFailed:		    'Problème d\'authentification, votre compte n\'est peut être pas activé',
                notAuthenticated:	    'Cette action nécessite une authentification, veuillez vous identifier',
                userToggleActive:       'Le status de l\'utilisateur a bien été changé',
                wrongPassword:		    'Les deux mots de passe sont différents',
                existingAccount:	    'Désolé votre compte n\'a pas pu être créé car votre adresse email existe déjà',
                accountCreated:		    'Vous allez recevoir un email pour l\'activation de votre compte',
                accountWrongPassword:	'Erreur de mot de passe, essayez de nouveau !',
                accountNotActive:		'Votre compte n\'a pas encore été activé',
                accountNotExist:		'Nous n\'avons pas de compte associé à cet email',
                notJoined:			    'Nous n\'avons pas réussi à enregistrer votre participation. Veuillez recommencer svp',
                userJoined:			    'Nous vous confirmons la réception de votre demande de participation à ce voyage',
                notAbleParticipate:     'Désolé cette course n\'a pas pu être ajoutée à votre agenda',
                addParticipate:         'Cette course a été ajoutée à votre agenda',
                infoRequestReceived:    'Nous avons bien reçu votre demande d\'information, nous revenons vers vous rapidement',
                runRequestReceived:     'Nous avons bien reçu votre demande de création de course, nous revenons vers vous rapidement',
                journeyValidationDone:  'Merci de votre validation, vos commentaires seront pris en compte pour améliorer notre service',
                accountUpdated:			'Vos information ont été mise à jour',
                notUpdatedAccount:		'Désolé en raison d\'un problème vos informations n\'ont pas été mise à jour',
                bankAccountNotSaved:	'En raison d\'un problème technique vos informations bancaires n\'ont pas été enregistrées',
                bankAccountSaved:		'Vos informations bancaires ont bien été enregistrées',
                userNotDeleted:         'L\'utilisateur n\'a pas pu être supprimé',
                userDeleted:            'L\'utilisateur vient d\'être supprimé',
                userPictureSaved:       'Votre image a bien été sauvegardée',
                userPictureRemoved:     'Votre image a bien été supprimée',
                emailOptionsNotSaved:	'Les informations sur les emails n\'ont pas été sauvegardées',
                emailOptionsSaved:		'Les informations sur les emails ont été sauvegardées',
                pageSaved:				'Votre page a été sauvegardée',
                joinCancelled:          'Votre demande d\'annulation de voyage a bien été prise en compte',
                joinNotCancelled:       'Votre demande d\'annulation de voyage n\'a malheureusement pas pu être prise en compte',
                journeyCreated:         'Votre trajet vient d\'être créé',
                journeyNotCreated:      'Malheureusement votre trajet n\'a pas pu être créé en raison d\'un problème technique',
                messageDeleted:         'Votre message a bien été supprimé',
                notAbleDeleteMessage:   'Malheureusement nous n\'avons pas réussi à supprimer votre message',
                journeyCanceled:        'Votre demande d\'annulation de voyage a bien été prise en compte',
                journeyNotCanceled:     'Votre demande d\'annulation de voyage n\'a malheureusement pas pu être prise en compte',
                passwordReset:          'Un nouveau mot de passe vient de vous être envoyé par email',
                passwordNotReset:       'En raison d\'un problème technique votre mot de passe n\'a pas pu être modifié',
                runUpdated:             'La course a été mise à jour',
                runCreated:             'La course a bien été créée'
            };

            $httpBackend.whenGET('/api/user/me').respond({
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: null
            });

            $httpBackend.whenPOST('/api/user').respond({msg : {
                id: 2,
                firstname: 'Richard',
                lastname: 'Couret',
                address: 'Bouffemont',
                phone: '0689876547',
                email: 'richard.couret@free.fr',
                itra: '?id=84500&nom=COURET#tab',
                isActive: 0,
                role: 'editor',
                picture: null
            }, type: 'success'});

            $httpBackend.whenGET('/api/inbox/unread/nb/msg').respond(200, 2);

            $httpBackend.whenPOST('/api/journey/confirm').respond({msg: 'draftJourneySaved', type: 'success'});

            ctrl = $controller('RunnableMainController',
                {$scope: scope, $rootScope: rootScope, AUTH_EVENTS: AUTH_EVENTS,
                    USER_ROLES: USER_ROLES, USER_MSG: USER_MSG});
        }));

        it ('Start controller', function () {
            expect(rootScope.currentUser).toEqual(null);
            expect(rootScope.isAuthenticated).not.toBeTruthy();
            expect(rootScope.isAdmin).not.toBeTruthy();
            $httpBackend.flush();
            rootScope.$on('USER_MSG', function (event, data) {
                expect(data.msg).toEqual('test');
            });
            rootScope.$broadcast('USER_MSG', {msg: 'test', type: 'success'});
        });

        it ('Test USER_MSG broadcast', function () {
            expect(rootScope.currentUser).toEqual(null);
            expect(rootScope.isAuthenticated).not.toBeTruthy();
            expect(rootScope.isAdmin).not.toBeTruthy();
            rootScope.$on('USER_MSG', function (event, data) {
                expect(data.msg).toEqual('runUpdated');
            });
            rootScope.$broadcast('USER_MSG', {msg: 'runUpdated', type: 'success'});
        });

        it ('Show Login', function () {
            expect(rootScope.currentUser).toEqual(null);
            expect(rootScope.isAuthenticated).not.toBeTruthy();
            expect(rootScope.isAdmin).not.toBeTruthy();
            scope.showLogin();
        });

        it ('Invite friend', function () {
            expect(rootScope.currentUser).toEqual(null);
            expect(rootScope.isAuthenticated).not.toBeTruthy();
            expect(rootScope.isAdmin).not.toBeTruthy();
            scope.inviteFriend();
        });

        it ('Create user', function () {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test'
            };
            scope.createUser(user);
            $httpBackend.flush();
        });

        it ('Create user and confirm a journey', function () {
            var user = {
                firstname : 'Test',
                lastname : 'Creation',
                address : 'Saint Germain en Laye',
                email : 'test.creation@user.fr',
                password : 'test',
                password_confirmation : 'test'
            };
            rootScope.draftId = 'JNY364573';
            scope.createUser(user);
            $httpBackend.flush();
        });
    });
});