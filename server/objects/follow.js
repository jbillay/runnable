/* user object */

var db = require('../models');
var async = require('async');
var Run = require('./run');
var Journey = require('./journey');
var User = require('./user');

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
	global.db.models.follow.create(this, function (err, newFollow) {
		if (err) {
			done(err, null);
		} else {
			done(null, newFollow);
		}
	});
};

follow.prototype.remove = function (done) {
   'use strict';
	console.log('try to remove follow for the ' + this.type + ' on id ' + this.type_id);
	global.db.models.follow.find({owner_id: this.owner_id, type: this.type, type_id: this.type_id}).
		remove(function (err) {
			if (err) {
				done(err);
			} else {
				done(null);
			}
		});

}

follow.prototype.getMyList = function (id, done) {
    'use strict';
	global.db.models.follow.find({owner_id: id}, function (err, follows) {
		if (err) {
			done(err, null);
		}
        done(null, follows);
	});
};

follow.prototype.getMyListWithResume = function (id, done) {
    'use strict';
	global.db.models.follow.find({owner_id: id}, function (err, follows) {
		if (err) {
			done(err, null);
		}
		done(null, follows);
	});
};

follow.prototype.getById = function (id, done) {
    'use strict';
	global.db.models.follow.find({id: id}, function (err, follow) {
		if (err) {
			done(err, null);
		}
        done(null, follow[0]);
	});
};

module.exports = follow;
