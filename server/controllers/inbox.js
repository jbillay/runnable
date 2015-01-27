/**
 * Created by jeremy on 25/01/15.
 */

var Inbox = require('../objects/inbox');

exports.add = function (req, res) {
    'use strict';
	var message = req.body.message,
        title = req.body.title,
		userId = req.body.userId,
		inbox = new Inbox();
	inbox.add(message, title, userId, function (err, message){
		if (err) {
			res.jsonp('{"msg": "notAbleAddMessage", "type": "error"}');
		}
		res.json('{"msg": "addMessage", "type": "success"}');
	});
};

exports.getList = function (req, res) {
    'use strict';
	var inbox = new Inbox();
	inbox.getList(req.user, function (err, messages){
		if (err) {
			res.jsonp('{"msg": "notAbleGetMessage", "type": "error"}');
		}
		res.json(messages);
	});
};

exports.get = function (req, res) {
    'use strict';
	var inbox = new Inbox();
	// TO BE IMPLEMENTED
};

exports.read = function (req, res) {
    'use strict';
	var messageId = req.body.messageId,
		inbox = new Inbox();
	inbox.setReadFlag(messageId, true, function (err, message){
		if (err) {
			res.jsonp('{"msg": "NotAbleMessageRead", "type": "error"}');
		}
		res.json('{"msg": "messageRead", "type": "success"}');
	});
};

exports.unread = function (req, res) {
    'use strict';
	var messageId = req.body.messageId,
		inbox = new Inbox();
	inbox.setReadFlag(messageId, false, function (err, message){
		if (err) {
			res.jsonp('{"msg": "NotAbleMessageUnread", "type": "error"}');
		}
		res.json('{"msg": "messageUnread", "type": "success"}');
	});
};
