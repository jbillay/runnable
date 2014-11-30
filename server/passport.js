var passport = require('passport');
// These are different types of authentication strategies that can be used with Passport. 
var LocalStrategy = require('passport-local').Strategy;
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
				done(null, false, req.flash('loginMessage', 'Désolé nous avons un problème technique !!'));
			}
			if (!user) {
				done(null, false, req.flash('loginMessage', "Cette utilisateur n'existe pas."));
			} else if (!user.authenticate(password)) {
				done(null, false, req.flash('loginMessage', 'Oops! Votre compte est peut être pas encore activé.'));
			} else {
				console.log('Login (local) : { id: ' + user.id + ', email ' + user.email + ' }');
				done(null, user);
			}
		});
	}
));

module.exports = passport;