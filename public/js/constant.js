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
    });
