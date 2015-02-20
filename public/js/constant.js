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
	constant('USER_MSG', {
		passwordReseted:	    'Un nouveau mot de passe vient de vous être envoyé',
		passwordUpdated:	    'Votre mot de passe a été mis à jour',
		userAuthFailed:		    'Problème d\'authentification, votre compte n\'est peut être pas activé',
		notAuthenticated:	    'Cette action nécessite une authentification, veuillez vous identifier',
        userToggleActive:       'Le status de l\'utilisateur a bien été changé',
		wrongPassword:		    'Les deux mots de passe sont différents',
		existingAccount:	    'Désolé votre compte n\'a pas pu être créé car votre adresse email existe déjà',
		accountCreated:		    'Vous allez recevoir un email pour l\'activation de votre compte',
		notJoined:			    'Nous n\'avons pas réussi à enregistrer votre participation. Veuillez recommencer svp',
		userJoined:			    'Nous vous confirmons la réception de votre demande de participation à ce voyage',
        notAbleParticipate:     'Désolé cette course n\'a pas pu être ajoutée à votre agenda',
        addParticipate:         'Cette course a été ajoutée à votre agenda',
        infoRequestReceived:    'Nous avons bien reçu votre demande d\'information, nous revenons vers vous rapidement',
        journeyValidationDone:  'Merci de votre validation, vos commentaires seront pris en compte pour améliorer notre service'
	});
