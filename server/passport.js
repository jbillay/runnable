var passport = require('passport');
// These are different types of authentication strategies that can be used with Passport. 
var LocalStrategy = require('passport-local').Strategy;
var db = require('./models');

//Serialize sessions
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    global.db.models.users.find({id: id}, function (err, user) {
		if (err) {
			done(err, null);
		}
        console.log('Session: { id: ' + user[0].id + ', email: ' + user[0].email + ' }');
        done(null, user[0]);
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
		global.db.models.users.find({ email: email }, function (err, user) {
			if (!user[0]) {
				done(null, false, req.flash('loginMessage', 'No user found.'));
			} else if (!user[0].validPassword(password)) {
				done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
			} else {
				console.log('Login (local) : { id: ' + user[0].id + ', email ' + user[0].email + ' }');
				done(null, user[0]);
			}
		});
	}
));

module.exports = passport;