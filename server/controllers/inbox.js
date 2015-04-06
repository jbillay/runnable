/**
 * Created by jeremy on 25/01/15.
 */

var Inbox = require('../objects/inbox');
var Mail = require('../objects/mail');
var User = require('../objects/user');

exports.add = function (req, res) {
    'use strict';
	var template = req.body.template,
        values = req.body.values,
		userId = req.body.userId,
		inbox = new Inbox(),
        user = new User();
    new Mail().then(function (mail) {
        mail.generateContent(template, values)
            .then(function (mail) {
                user.getById(userId, function (err, user) {
                    if (err) {
                        res.jsonp(new Error('Unable to get user : ' + userId));
                    } else {
                        var message = mail.getContentHtml(),
                            title = mail.getSubject();
                        mail.setTo(user.email);
                        mail.send();
                        inbox.add(message, title, userId, function (err, message){
                            if (err) {
                                res.jsonp('{"msg": "notAbleAddMessage", "type": "error"}');
                            } else {
                                res.jsonp(message);
                            }
                        });
                    }
                });
            })
            .catch(function (err) {
                res.jsonp(new Error('Unable to send mail : ' + err));
            });
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