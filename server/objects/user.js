/* user object */

var models = require('../models');
var Itra = require('../objects/itra');

function user() {
    'use strict';
	this.id = null;
	this.firstname = null;
	this.lastname = null;
	this.address = null;
    this.phone = null;
    this.email = null;
	this.password = null;
	this.hashedPassword = null;
	this.provider = null;
	this.salt = null;
	this.isActive = null;
	this.role = null;
    this.createdAt = null;
    this.updatedAt = null;
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
    if (user.phone) {
        this.phone = user.phone; }
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
    if (user.createdAt) {
        this.createdAt = user.createdAt; }
    if (user.updatedAt) {
        this.updatedAt = user.updatedAt; }
};

user.prototype.update = function (id, datas, done) {
    'use strict';
    var that = this;
    models.User.find({ where: {id: id}})
        .then(function (user) {
            user.updateAttributes(datas)
                .then(function (updatedUser) {
                    done(null, updatedUser);
                })
                .catch(function (err) {
                    done(err, null);
                });
        })
        .catch(function (err) {
            done(err, null);
        });
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
			console.log(err);
			done(err, null);
		});
};

user.prototype.activate = function (id, hash, done) {
    'use strict';
	models.User.find({ where: {id: id}})
		.then(function (user) {
			var userhash = new Date(user.createdAt).getTime().toString();
			if (hash === userhash) {
				user.isActive = true;
				user.save()
					.then(function (newUser) {
						console.log('Activation done');
						done(null, newUser);
					})
					.catch(function (err) {
						done(err, null);
					});
			} else {
				console.log('Failed on activation');
				done(new Error('key different'), null);
			}
		})
		.catch(function (err) {
			done(err, null);
		});
};

user.prototype.getItraCode = function (user, done) {
	'use strict';
	var itra = new Itra(this.firstname, this.lastname, null);
	itra.getCode(function (err, code) {
		if (err) {
			done(err, null);
		} else {
            if (code) {
                user.itra = code;
                user.save();
            }
		    done(null, code);
        }
	});
};

user.prototype.getRuns = function (user, done) {
	'use strict';
    console.log(user.firstname);
	var itra = new Itra(user.firstname, user.lastname, user.itra);
	itra.getRuns(function (err, runs) {
		if (err) {
			done(err, null);
		} else {
			done(null, runs);
		}
	});
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
	models.User.find({where: {email: email}, include: [models.Inbox]})
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

user.prototype.updatePassword = function (email, password, done) {
    'use strict';
	console.log('Try to udpate password');
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
				});
		})
		.catch(function (err) {
			console.log('Password not updated : ' + err);
			done(err, null);
		});
};

user.prototype.toggleActive = function (id, done) {
	'use strict';
    models.User.find({where: {id: id}})
		.then(function (user) {
			if (user.isActive === true) {
				user.isActive = false;
			} else {
				user.isActive = true;
			}
			user.save()
				.then(function (newUser) {
					done(null, newUser);
				});
		})
		.catch(function (err) {
			done(err, null);
		});
};

user.prototype.getPublicDriverInfo = function (id, done) {
    'use strict';
    models.Journey.findAll({where: {UserId: id}, include: [models.Join]})
        .then(function (journeys) {
            var joinList = [];
            journeys.forEach(function (journey) {
                journey.Joins.forEach(function (join) {
                    joinList.push(join.id);
                });
            });
            models.ValidationJourney.findAll({where: {JoinId: {in: joinList}}})
                .then(function (validation) {
                    done(null, validation);
                })
                .catch(function (err) {
                    done(err, null);
                });
        });
};

user.prototype.getPublicInfo = function (id, done) {
    'use strict';
	models.User.find({  where: {id: id},
                        include: [models.Journey, models.Join, {
						   	model: models.Participate,
							as: 'Participates',
							include: [ models.Run ]}]
                     })
		.then(function (user) {
			done(null, user);
		})
		.catch(function (err) {
			done(err, null);
		});
};

user.prototype.delete = function (id, done) {
    'use strict';
    models.User.find({ where: {id: id}})
        .then(function (user) {
            if (!user) {
                done(new Error('User not found'), null);
            }
            user.destroy()
                .then(function () {
                    done(null, 'deleted');

                })
                .catch(function (err) {
                    done(err, null);
                });
        });
};

module.exports = user;
