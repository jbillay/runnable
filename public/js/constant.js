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
        notAbleParticipate:     'Désolé cette course n\'a pas pu être ajoutée à votre liste de suivi',
        addParticipate:         'Vous suivez maintenant cette course, vous serez notifié des trajets créés',
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
        draftJourneySaved:      'Votre trajet vient d\'être créé',
        draftJourneyCreated:    'Merci de vous identifier pour confirmer la création de votre voyage',
        draftJourneyNotCreated: 'Malheureusement votre trajet n\'a pas pu être créé en raison d\'un problème technique',
        journeyNotCreated:      'Malheureusement votre trajet n\'a pas pu être créé en raison d\'un problème technique',
        draftJourneyNotSaved:   'Malheureusement votre trajet n\'a pas pu être créé en raison d\'un problème technique',
        messageDeleted:         'Votre message a bien été supprimé',
        notAbleDeleteMessage:   'Malheureusement nous n\'avons pas réussi à supprimer votre message',
        journeyCanceled:        'Votre demande d\'annulation de voyage a bien été prise en compte',
        journeyNotCanceled:     'Votre demande d\'annulation de voyage n\'a malheureusement pas pu être prise en compte',
        passwordReset:          'Un nouveau mot de passe vient de vous être envoyé par email',
        passwordNotReset:       'En raison d\'un problème technique votre mot de passe n\'a pas pu être modifié',
        runUpdated:             'La course a été mise à jour',
        journeyUpdated:         'Votre parcours a été mis à jour',
        runCreated:             'La course a bien été créée',
        partnerCreated:         'Le partenaire a bien été créé',
        partnerInfoSent:        'Les informations ont bien été envoyées au partenaire',
        forceCompleteSuccess:   'Le voyage a bien été complété et les notifications vont être envoyées',
        forceCompleteFailed:    'Le voyage n\'a pas pu être complété en raison d\'un problème technique',
        defaultFeeUpdated:      'Les information sur les marges ont bien été sauvegardées',
        feeCreated:             'La nouvelle marge a bien été sauvegardée'
	});
