/**
 * Created by jeremy on 14/08/2014.
 */

var controllers = require('./controllers').init();
var cors = require('cors');

module.exports = function (app, passport, auth) {
    'use strict';
	console.log('Init Routes');
    // serve index and view partials
    app.get('/', controllers.root.default);
    app.get('/logout', controllers.root.logout);
    /**
     * @api {post} /login User login
     * @apiVersion 1.0.0
     * @apiName AuthenticateUser
     * @apiGroup Authenticate
     *
     * @apiParam {String} email User email
     * @apiParam {String} password User password
     *
     * @apiSuccess {String} msg Confirmation message
     * @apiSuccess {String} type Type of return
     * @apiSuccess {String} token Authentication token
     *
     * @apiSuccessExample {jsonp} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *        "msg": {
     *          "id": 2,
     *          "firstname": "Richard",
     *          "lastname": "Couret",
     *          "address": "Bouffemont",
     *          "phone": "0689876847",
     *          "email": "richard.couret@couret.fr",
     *          "itra": "?id=84500&nom=COURET#tab",
     *          "isActive": true,
     *          "role": "editor",
     *          "picture": null,
     *        },
     *        "type": "success",
     *        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiZmlyc3RuYW1lIjoiUmljaGFyZCIsImxhc3RuYW1lIjoiQ291cmV0IiwiYWRkcmVzcyI6IkJvdWZmZW1vbnQiLCJwaG9uZSI6IjA2ODk4NzY1NDciLCJlbWFpbCI6InJpY2hhcmQuY291cmV0QGZyZWUuZnIiLCJoYXNoZWRQYXNzd29yZCI6IlZNY0xFb1ZMdlhkb2xEbHNSekY4Y1ZqbzJzd0ZmVjFNbzc2eWNSS09iSTAwcFZmQnk3M0l3bFlqL21YM1orUEg4NzNrNTdHdTh2V0NiV285di9DeHV3PT0iLCJwcm92aWRlciI6ImxvY2FsIiwic2FsdCI6ImQzNk9HdnViZStqVU84bGNCcG1yK1E9PSIsIml0cmEiOiI_aWQ9ODQ1MDAmbm9tPUNPVVJFVCN0YWIiLCJpc0FjdGl2ZSI6dHJ1ZSwicm9sZSI6ImVkaXRvciIsInBpY3R1cmUiOm51bGwsImNyZWF0ZWRBdCI6IjIwMTUtMDItMDRUMTc6NTU6MzkuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMTYtMDYtMDVUMDg6MDY6NDUuMDAwWiJ9.fipmCkn4UVQD9J7VboZv3VEroGoDAQT1mWwHsTaMXKM"
     *     }
     *
     */
    app.post('/login', cors(), function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (!user) {
				res.jsonp({msg: err, type: 'error'});
			} else {
				req.logIn(user, function(err) {
					if (err) { return next(err); }
					res.jsonp({msg: user, type: 'success', token: user.token});
				});
			}
		})(req, res, next);
	});

    /**
     * @api {post} /api/authenticate Partner authentication
     * @apiVersion 1.0.0
     * @apiName AuthenticatePartner
     * @apiGroup Authenticate
     *
     * @apiParam {String} apikey Partner identification key
     *
     * @apiSuccess {String} msg Confirmation message
     * @apiSuccess {String} type Type of return
     * @apiSuccess {String} token Authentication token
     *
     * @apiSuccessExample {jsonp} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *        "msg": {
     *          "id": 2,
     *          "firstname": "Richard",
     *          "lastname": "Couret",
     *          "address": "Bouffemont",
     *          "phone": "0689876847",
     *          "email": "richard.couret@couret.fr",
     *          "itra": "?id=84500&nom=COURET#tab",
     *          "isActive": true,
     *          "role": "editor",
     *          "picture": null,
     *        },
     *        "type": "success",
     *        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiZmlyc3RuYW1lIjoiUmljaGFyZCIsImxhc3RuYW1lIjoiQ291cmV0IiwiYWRkcmVzcyI6IkJvdWZmZW1vbnQiLCJwaG9uZSI6IjA2ODk4NzY1NDciLCJlbWFpbCI6InJpY2hhcmQuY291cmV0QGZyZWUuZnIiLCJoYXNoZWRQYXNzd29yZCI6IlZNY0xFb1ZMdlhkb2xEbHNSekY4Y1ZqbzJzd0ZmVjFNbzc2eWNSS09iSTAwcFZmQnk3M0l3bFlqL21YM1orUEg4NzNrNTdHdTh2V0NiV285di9DeHV3PT0iLCJwcm92aWRlciI6ImxvY2FsIiwic2FsdCI6ImQzNk9HdnViZStqVU84bGNCcG1yK1E9PSIsIml0cmEiOiI_aWQ9ODQ1MDAmbm9tPUNPVVJFVCN0YWIiLCJpc0FjdGl2ZSI6dHJ1ZSwicm9sZSI6ImVkaXRvciIsInBpY3R1cmUiOm51bGwsImNyZWF0ZWRBdCI6IjIwMTUtMDItMDRUMTc6NTU6MzkuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMTYtMDYtMDVUMDg6MDY6NDUuMDAwWiJ9.fipmCkn4UVQD9J7VboZv3VEroGoDAQT1mWwHsTaMXKM"
     *     }
     *
     */
    app.post('/api/authenticate', cors(), function(req, res, next) {
		passport.authenticate('localapikey', function(err, user, info) {
			if (!user) {
				res.jsonp({msg: err, type: 'error'});
			} else {
				req.logIn(user, function(err) {
					if (err) { return next(err); }
					res.jsonp({msg: user, type: 'success', token: user.token});
				});
			}
		})(req, res, next);
	});
    app.get('/api/version', controllers.root.version);
	app.post('/api/send/mail', controllers.root.sendMail);

    app.get('/api/home/feedback', controllers.home.userFeedback);

	app.post('/api/user', cors(), controllers.user.create);
	app.put('/api/user', auth.requiresLogin, controllers.user.update);
	app.post('/api/user/password/reset', controllers.user.resetPassword);
	app.post('/api/user/password/update', auth.requiresLogin, controllers.user.updatePassword);
	app.post('/api/user/picture', auth.requiresLogin, controllers.root.fileParser, controllers.user.uploadPicture);
	app.get('/api/user/remove/picture', auth.requiresLogin, controllers.user.deletePicture);
	app.post('/api/user/invite', auth.requiresLogin, controllers.user.invite);
    app.get('/api/user/active/:id/:hash', controllers.user.active);
    app.get('/api/user/:id/:hash', controllers.user.active);
    app.get('/api/user/public/info/:id', controllers.user.publicInfo);
    app.get('/api/user/public/driver/:id', controllers.user.publicDriverInfo);
    app.get('/api/user/me', auth.requiresLogin, controllers.user.me);
    app.get('/api/user/runs', auth.requiresLogin, controllers.user.showRuns);
    app.get('/api/user/journeys', auth.requiresLogin, controllers.user.showJourneys);
    app.get('/api/user/joins', auth.requiresLogin, controllers.user.showJoins);

    app.post('/api/run', cors(), auth.requiresLogin, controllers.root.fileParser, controllers.run.create);
    app.put('/api/run', auth.requiresLogin, controllers.run.update);
    app.post('/api/run/search', controllers.run.search);
    app.get('/api/run/list', cors(), controllers.run.activeList);
    app.get('/api/run/:id', cors(), controllers.run.detail);
    app.get('/api/run/next/:nb', controllers.run.next);

    app.post('/api/journey', cors(),
        controllers.journey.create,
        controllers.participate.notify,
        controllers.partner.notifyJourneyCreation);
    app.put('/api/journey', auth.requiresLogin, controllers.journey.update, controllers.journey.notifyJoinedModification);
    app.post('/api/journey/cancel', auth.requiresLogin, controllers.journey.cancel);
    app.post('/api/journey/confirm', cors(),
        auth.requiresLogin,
        controllers.journey.confirm,
        controllers.participate.notify,
        controllers.partner.notifyJourneyCreation);
    app.get('/api/journey/open', controllers.journey.openList);
	app.get('/api/journey/:id', controllers.journey.detail);
    app.get('/api/journey/run/:id', cors(), controllers.journey.listForRun);
    app.get('/api/journey/next/:nb', controllers.journey.next);
    app.get('/api/journey/book/:id', controllers.journey.bookSpace);

    app.post('/api/discussion/private/message',
        auth.requiresLogin,
        controllers.discussion.addPrivateMessage,
        controllers.discussion.notificationMessage);
    app.post('/api/discussion/public/message',
        controllers.discussion.addPublicMessage,
        controllers.discussion.notificationMessage);
    app.get('/api/discussion/users/:id', auth.requiresLogin, controllers.discussion.getUsers);
    app.get('/api/discussion/public/messages/:id', controllers.discussion.getPublicMessages);
    app.get('/api/discussion/private/messages/:id', auth.requiresLogin, controllers.discussion.getPrivateMessages);

    app.post('/api/validation', auth.requiresLogin, controllers.validation_journey.validate);

    app.post('/api/inbox/msg', auth.requiresLogin, controllers.inbox.add);
    app.post('/api/inbox/msg/read', auth.requiresLogin, controllers.inbox.read);
    app.post('/api/inbox/msg/unread', auth.requiresLogin, controllers.inbox.unread);
    app.post('/api/inbox/msg/delete', auth.requiresLogin, controllers.inbox.delete);
    app.get('/api/inbox/msg', auth.requiresLogin, controllers.inbox.getList);
    app.get('/api/inbox/unread/nb/msg', auth.requiresLogin, controllers.inbox.countUnread);

    app.post('/api/join', auth.requiresLogin, controllers.join.create);
	app.get('/api/join/:id', auth.requiresLogin, controllers.join.detail);
    app.get('/api/join/journey/:id', controllers.join.listForJourney);
    app.get('/api/join/cancel/:id', auth.requiresLogin, controllers.join.cancel);

    app.post('/api/participate/add', auth.requiresLogin, controllers.participate.add);
    app.get('/api/participate/user/list', controllers.participate.userList);
    app.get('/api/participate/run/user/list/:id', controllers.participate.userRunList);

	app.get('/api/admin/users', auth.requireAdmin, controllers.user.list);
	app.get('/api/admin/runs', auth.requireAdmin, controllers.run.list);
    app.get('/api/admin/journeys', auth.requireAdmin, controllers.journey.list);
    app.get('/api/admin/joins', auth.requireAdmin, controllers.join.list);
	app.post('/api/admin/run/active', auth.requireAdmin, controllers.run.toggleActive);
	app.post('/api/admin/user/active', auth.requireAdmin, controllers.user.toggleActive);
    app.post('/api/admin/user/remove', auth.requireAdmin, controllers.user.remove);
    app.post('/api/admin/options', auth.requireAdmin, controllers.option.saveOptions);
	app.get('/api/admin/option/:name', auth.requireAdmin, controllers.option.getOption);
    app.get('/api/admin/options', auth.requireAdmin, controllers.option.getOptions);
    app.post('/api/admin/sendMail', auth.requireAdmin, controllers.root.sendTestMail);
	app.post('/api/admin/page', auth.requireAdmin, controllers.page.save);
	app.get('/api/admin/pages', auth.requireAdmin, controllers.page.getList);
	app.get('/api/admin/user/bankaccount/:id', auth.requireAdmin, controllers.bank_account.getByUser);
    app.post('/api/admin/journey/payed', auth.requireAdmin, controllers.journey.togglePayed);
    app.get('/api/admin/journey/toPay', auth.requireAdmin, controllers.journey.toPay);
    app.get('/api/admin/join/toRefund', auth.requireAdmin, controllers.join.toRefund);
    app.post('/api/admin/join/refund', auth.requireAdmin, controllers.join.refund);
    app.post('/api/admin/invoice/complete', auth.requireAdmin, controllers.invoice.complete, controllers.journey.notifyJoin);
    app.get('/api/admin/fees', auth.requireAdmin, controllers.fee.getList);
    app.get('/api/admin/default/fee', auth.requireAdmin, controllers.fee.getDefaultFee);
    app.post('/api/admin/fee', auth.requireAdmin, controllers.fee.add);
    app.put('/api/admin/fee', auth.requireAdmin, controllers.fee.update);
    app.delete('/api/admin/fee/:id', auth.requireAdmin, controllers.fee.delete);
    app.post('/api/admin/partner', auth.requireAdmin, controllers.partner.create, controllers.partner.sendInfo);
    app.post('/api/admin/partner/info', auth.requireAdmin, controllers.partner.sendInfo);
    app.get('/api/admin/partners', auth.requireAdmin, controllers.partner.getList);
    app.get('/api/admin/partner/:token', auth.requireAdmin, controllers.partner.getByToken);

    app.get('/api/pictures/:runId', controllers.picture.getList);
    app.get('/api/picture/:id', controllers.picture.get);
	app.post('/api/picture/default/:id/:runId', auth.requiresLogin, controllers.picture.setDefault);
    app.post('/api/picture/:runId', auth.requiresLogin, controllers.root.fileParser, controllers.picture.add);
    app.get('/api/picture/delete/:id', auth.requiresLogin, controllers.picture.remove);

    app.get('/api/page/:tag', controllers.page.getByTag);

    app.get('/api/fee/:journeyId', auth.requiresLogin, controllers.fee.getFee);
    app.get('/api/fee/check/:code', auth.requiresLogin, controllers.fee.checkCode);

    app.get('/api/invoice', auth.requiresLogin, controllers.invoice.getByUser);
    app.get('/api/invoice/driver', auth.requiresLogin, controllers.invoice.getByDriver);

	app.post('/api/user/bankaccount', auth.requiresLogin, controllers.bank_account.save);
	app.get('/api/user/bankaccount', auth.requiresLogin, controllers.bank_account.get);

    app.post('/api/paypal/ipn', cors(), controllers.invoice.confirm, controllers.journey.notifyJoin);
	
    app.get('/partials/:name', controllers.root.partials);

	// For technical purpose
	app.get('/sync', controllers.root.sync);
	
    // redirect all others to the index (HTML5 history)
    app.get('*', controllers.root.default);
};