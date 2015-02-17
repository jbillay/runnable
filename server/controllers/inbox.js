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
		res.jsonp('{"msg": "addMessage", "type": "success"}');
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

exports.get = function (req, res) {
    'use strict';
	var inbox = new Inbox();
	// TO BE IMPLEMENTED
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
		console.log(nb);
		res.jsonp(nb);
	});
};