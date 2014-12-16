/* user object */

var models = require('../models');
var Itra = require('../objects/itra');

function user() {
    'use strict';
	this.id = null;
	this.firstname = null;
	this.lastname = null;
	this.address = null;
    this.email = null;
	this.password = null;
	this.hashedPassword = null;
	this.provider = null;
	this.salt = null;
	this.isActive = null;
	this.role = null;
}

user.prototype.get = function () {
    'use strict';
	return this;
};

user.prototype.set = function (user) {
    'use strict';
	if (user.id) {
		this.id = user.id; }
	if (user.firstname) {
		this.firstname = user.firstname; }
	if (user.lastname) {
		this.lastname = user.lastname; }
	if (user.address) {
		this.address = user.address; }
	if (user.email) {
		this.email = user.email; }
	if (user.password) {
		this.password = user.password; }
	if (user.isActive) {
		this.isActive = user.isActive; }
	else {
		this.isActive = false;
	}
	if (user.role) {
		this.role = user.role; }
	else {
		this.role = 'user';
	}
	console.log(this.firstname + ' ' + this.lastname);
};

user.prototype.save = function (done) {
    'use strict';
	var user = models.User.build(this);

	user.provider = 'local';
	user.salt = user.makeSalt();
	user.hashedPassword = user.encryptPassword(this.password, user.salt);
	console.log('New User (local) : { id: ' + user.id + ' email: ' + 
					user.email + ' }');
	user.save()
		.then(function (newUser) {
			done(null, newUser);
		})
		.catch(function (err) {
			done(err, null);
		});
};

user.prototype.activate = function (id, hash, done) {
	models.User.find({ where: {id: id}})
		.then(function (user) {
			if (hash === user.hashedPassword) {
				user.isActive = true;
				user.save()
					.then(function (newUser) {
						done(null);
					})
					.catch(function (err) {
						done(err);
					})
			} else {
				done(err);
			}
		})
		.catch(function (err) {
			done(err);
		});
};

user.prototype.getItraCode = function (done) {
	'use strict';
	var itra = new Itra(this.firstname, this.lastname, null);
	itra.getCode(function (err, code) {
		if (err) {
			done(err, null);
		}
		done(null, code);
	});
};

user.prototype.getRuns = function (user, done) {
	'use strict';
	var itra = new Itra(user.firstname, user.lastname, user.itra);
	itra.getRuns(function (err, runs) {
		if (err) {
			done(err, null);
		} else {
			done(null, runs);
		}
	})
};

user.prototype.getById = function (id, done) {
    'use strict';
	models.User.find({ where: {id: id}})
		.then(function (user) {
			done(null, user);
		})
		.catch(function (err) {
			done(err, null);
		});
};

user.prototype.getByEmail = function (email, done) {
    'use strict';
	models.User.find({ 	where: {email: email}})
		.then(function (user) {
			done(null, user);
		})
		.catch(function (err) {
			done(err, null);
		});
};

user.prototype.getList = function (done) {
    'use strict';
	models.User.findAll()
		.then(function (users) {
			done(null, users);
		})
		.catch(function (err) {
			done(err, null);
		});
};

user.prototype.resetMdp = function (email, password, done) {
    'use strict';
	models.User.find({ where: {email: email}})
		.then(function(user) {
			user.salt = user.makeSalt();
			user.hashedPassword = user.encryptPassword(password, user.salt);
			console.log('User (' + user.provider + ') Password reset : { email: ' + user.email + ' password: ' + password + ' }');
			user.save()
				.then(function (newUser) {
					done(null, newUser);
				})
				.catch(function (err) {
					done(err, null);
				})
		})
		.catch(function (err) {
			console.log('Reset password : ' + err);
			done(err, null);
		});
};

user.prototype.toggleActive = function (id, done) {
	models.User.find({where: {id: id}})
		.then(function (user) {
			if (user.isActive === true) {
				user.isActive = false;
			} else {
				user.isActive = true;
			}
			user.save().success(function () {
				done(null);
			});
		})
		.catch(function (err) {
			done(err);
		});
};

module.exports = user;
