/**
 * Created by jeremy on 02/01/15.
 */

var models = require('../models');
var Journey = require('./journey');
var Join = require('./join');

function discussion() {
    'use strict';
    this.id = null;
    this.message = null;
    this.createdAt = null;
    this.updatedAt = null;
}

discussion.prototype.get = function () {
    'use strict';
    return this;
};

discussion.prototype.set = function (discussion) {
    'use strict';
    if (discussion.id) {
        this.id = discussion.id;
    }
    if (discussion.message) {
        this.message = discussion.message;
    }
    if (discussion.createdAt) {
        this.createdAt = discussion.createdAt;
    }
    if (discussion.updatedAt) {
        this.updatedAt = discussion.updatedAt;
    }
};

discussion.prototype.getUsers = function (journeyId, done) {
    'use strict';
    models.Journey.find({where: {id: journeyId}})
        .then(function (journey) {
            journey.getJoins().then(function (joins) {
                var userList = [];
                userList.push(journey.UserId);
                joins.forEach(function (join) {
                    userList.push(join.UserId);
                });
                models.User.findAll({where: {id: userList}}).then(function (users) {
                    done(null, users);
                }).catch(function (err) {
                    done(err, null);
                });
            });
        })
        .catch(function (err) {
            done(err, null);
        });
};

discussion.prototype.getMessages = function (journeyId, done) {
    'use strict';
    models.Discussion.findAll({where: {JourneyId: journeyId}, include: [models.User], order: 'createdAt DESC',})
        .then(function (messages) {
            done(null, messages);
        })
        .catch(function (err) {
            done(err, null);
        });
};

discussion.prototype.addMessage = function (message, journeyId, user, done) {
	var that = this;
	that.message = message;
	console.log('try to add message to journey run : ' + journeyId);
	models.Journey.find({where: {id: journeyId}})
        .then(function (journey) {
			models.User.find({where: {id: user.id}})
				.then(function(user) {
					models.Discussion.create(that)
						.then(function (newDiscussion) {
							newDiscussion.setUser(user)
								.then(function(newDiscussion) {
									newDiscussion.setJourney(journey)
										.then(function (newDiscussion) {
											done(null, newDiscussion);
										})
										.catch(function(err) {
											done(err, null);
										});
								});
						});
				});
		});
};

module.exports = discussion;