/* user object */

var models = require('../models');

function follow() {
    'use strict';
	this.id = null;
	this.owner_id = null;
	this.type = null;
	this.type_id = null;
}

follow.prototype.get = function () {
    'use strict';
	return this;
};

follow.prototype.set = function (follow) {
    'use strict';
	if (follow.id) {
		this.id = follow.id; }
	if (follow.owner_id) {
		this.owner_id = follow.owner_id; }
	if (follow.type) {
		this.type = follow.type; }
	if (follow.type_id) {
		this.type_id = follow.type_id; }
};

follow.prototype.setOwnerId = function (id) {
	this.owner_id = id;
};

follow.prototype.setType = function (type) {
	this.type = type;
};

follow.prototype.setTypeId = function (id) {
	this.type_id = id;
};

follow.prototype.save = function (done) {
    'use strict';
	console.log('try to create follow for the ' + this.type + ' on id ' + this.type_id);
	models.Follow.create(this)
		.error(function (err) {
			done(err, null);
		})
		.success(function (newFollow) {
			done(null, newFollow);
		});
};

follow.prototype.remove = function (done) {
   'use strict';
	console.log('try to remove follow for the ' + this.type + ' on id ' + this.type_id);
	models.Follow.find({where: {owner_id: this.owner_id, type: this.type, type_id: this.type_id}})
		.destroy()
		.error(function (err) {
			done(err);
		})
		.success(function () {
			done(null);
		});

}

follow.prototype.getMyList = function (id, done) {
    'use strict';
	models.User.find({where: {id: id}, include: [ models.Follow ]})
		.error(function (err) {
			done(err, null);
		})
		.success(function (user) {
			done(null, user.Follows);
		});
};

follow.prototype.getMyListWithResume = function (id, done) {
    'use strict';
	models.User.find({where: {id: id}, include: [ models.Follow ]})
		.error(function (err) {
			done(err, null);
		})
		.success(function (user) {
			done(null, user.Follows);
		});
};

follow.prototype.getById = function (id, done) {
    'use strict';
	models.Follow.find({where: {id: id}})
		.error(function (err) {
			done(err, null);
		})
		.success(function (follow) {
			done(null, follow);
		});
};

module.exports = follow;
