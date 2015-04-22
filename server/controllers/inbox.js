/**
 * Created by jeremy on 25/01/15.
 */

var Inbox = require('../objects/inbox');

exports.add = function (req, res) {
    'use strict';
	var template = req.body.template,
        values = req.body.values,
		userId = req.body.userId,
		inbox = new Inbox();

		inbox.add(template, values, userId, function (err, message){
			if (err) {
				res.jsonp('{"msg": "notAbleAddMessage", "type": "error"}');
			} else {
				res.jsonp(message);
			}
		});
};

exports.getList = function (req, res) {
    'use strict';
	var inbox = new Inbox();
	inbox.getList(req.user, function (err, messages){
		if (err) {
			res.jsonp('{"msg": "notAbleGetMessage", "type": "error"}');
		}
		res.jsonp(messages);
	});
};

exports.read = function (req, res) {
    'use strict';
	console.log('Make read message :' + req.body.messageId);
	var messageId = req.body.messageId,
		inbox = new Inbox();
	inbox.setIsRead(messageId, true, function (err, message){
		if (err) {
			res.jsonp('{"msg": "NotAbleMessageRead", "type": "error"}');
		}
		res.jsonp('{"msg": "messageRead", "type": "success"}');
	});
};

exports.unread = function (req, res) {
    'use strict';
	var messageId = req.body.messageId,
		inbox = new Inbox();
	inbox.setIsRead(messageId, false, function (err, message){
		if (err) {
			res.jsonp('{"msg": "NotAbleUnreadMessage", "type": "error"}');
		}
		res.jsonp('{"msg": "messageUnread", "type": "success"}');
	});
};

exports.countUnread = function (req, res) {
	'use strict';
	var inbox = new Inbox();
	inbox.countUnread(req.user.id, function (err, nb) {
		if (err) {
			res.jsonp('{"msg": "NotAbleCountUnreadMessage", "type": "error"}');
		}
		res.jsonp(nb);
	});
};

exports.delete = function (req, res) {
	'use strict';
	var messageId = req.body.messageId,
        inbox = new Inbox();
    inbox.delete(messageId, function (err, message) {
        if (err) {
            res.jsonp('{"msg": "NotAbleDeleteMessage", "type": "error"}');
        } else {
            res.jsonp('{"msg": "messageDeleted", "type": "success"}');
        }
    });
};