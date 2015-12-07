'use strict';

var passport = require('passport');
// These are different types of authentication strategies that can be used with Passport. 
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');
var User = require('./objects/user');

//Serialize sessions
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	var user = new User();
	user.getById(id, function(err, user) {
		if (err) {
			done(err, null);
		}
		done(null, user);
	});
});

//Use local strategy
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		console.log('Try authentificate user : ' + email);
		var user = new User();
		user.getByEmail(email, function (err, user) {
			if (err) {
				console.log('Err with authentification: ' + err);
				done(err, false);
			}
			if (!user) {
				console.log('User not exist');
				done('accountNotExist', false, 'toto');
			} else if (!user.isActivated()) {
				console.log('Oops! Votre compte est pas encore activé');
				done('accountNotActive', false, 'toto');
			} else if (!user.authenticate(password)) {
				console.log('Erreur avec votre mot de passe');
				done('accountWrongPassword', false, 'toto');
			} else {
                var token = jwt.sign(user, 'secretTokenKey4MyRunTrip$', {
                    expiresIn: 86400 // expires in 24 hours
                });
				user.salt = user.hashedPassword = user.provider = null;
                user.token = token;
				console.log('Login (local) : { id: ' + user.id + ', email ' + user.email + ' }');
				done(null, user);
			}
		});
	}
));

module.exports = passport;