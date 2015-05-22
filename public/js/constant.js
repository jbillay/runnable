/**
 * Created by jeremy on 09/12/14.
 */

/* Constant */

angular.module('runnable.constant', []).
    constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    }).
    constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        editor: 'editor',
        user: 'user'
    }).
	constant('DEFAULT_DISTANCE', 30).
	constant('USER_MSG', {
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
        NotAbleDeleteMessage:   'Malheureusement nous n\'avons pas réussi à supprimer votre message',
        journeyCanceled:        'Votre demande d\'annulation de voyage a bien été prise en compte',
        journeyNotCanceled:     'Votre demande d\'annulation de voyage n\'a malheureusement pas pu être prise en compte',
        passwordReset:          'Un nouveau mot de passe vient de vous être envoyé par email',
        passwordNotReset:       'En raison d\'un problème technique votre mot de passe n\'a pas pu être modifié'
	});
