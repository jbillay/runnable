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
		passwordReseted:	"Un nouveau mot de passe vient de vous être envoyé",
		passwordUpdated:	"Votre mot de passe a été mis à jour",
		passwordWrong:		"Vous avez fait une erreur dans la saisie de votre mot de passe",
		userAuthFailed:		"Problème d'authentification, votre compte n'est peut être pas acitvé",
		userUnknow:			"Cet utilisateur n'existe pas",
        userToggleActive:   "Le status de l'utilisateur a bien été changé"
	});
