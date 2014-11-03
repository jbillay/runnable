/* user object */

var models = require('../models');

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
	this.facebookUserId = null;
	this.twitterUserId = null;
	this.twitterKey = null;
	this.twitterSecret = null;
	this.github = null;
	this.openId = null;
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
	console.log(this.firstname + ' ' + this.lastname);
};

user.prototype.save = function (done) {
    'use strict';
	console.log('try to create user : ' + this.email);
	models.User.create(this)
		.error(function (err) {
			done(err, null);
		})
		.success(function (newUser) {
			done(null, newUser);
		});
};

user.prototype.getById = function (id, done) {
    'use strict';
	models.User.find({ where: {id: id}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (user) {
			done(null, user);
		});
};

user.prototype.getByEmail = function (email, done) {
    'use strict';
	models.User.find({ where: {email: email}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (user) {
			done(null, user);
		});
};

module.exports = user;
