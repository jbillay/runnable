/**
 * Created by jeremy on 14/08/2014.
 */

var controllers = require('./controllers').init();

module.exports = function (app, passport, auth) {
    'use strict';
	console.log('Init Routes');
    // serve index and view partials
    app.get('/', controllers.root.default);
    app.get('/logout', controllers.root.logout);
	app.post('/login', function(req, res, next) {
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
    app.get('/api/version', controllers.root.version);
	app.post('/api/send/mail', controllers.root.sendMail);

    app.get('/api/home/feedback', controllers.home.userFeedback);

	app.post('/api/user', controllers.user.create);
	app.put('/api/user', auth.requiresLogin, controllers.user.update);
	app.post('/api/user/password/reset', controllers.user.resetPassword);
	app.post('/api/user/password/update', auth.requiresLogin, controllers.user.updatePassword);
	app.post('/api/user/picture', auth.requiresLogin, controllers.user.uploadPicture);
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

    app.post('/api/run', auth.requiresLogin, controllers.run.create);
    app.put('/api/run', auth.requiresLogin, controllers.run.update);
    app.post('/api/run/search', controllers.run.search);
    app.get('/api/run/list', controllers.run.activeList);
    app.get('/api/run/:id', controllers.run.detail);
    app.get('/api/run/next/:nb', controllers.run.next);

    app.post('/api/journey', controllers.journey.create, controllers.participate.notify);
    app.put('/api/journey', auth.requiresLogin, controllers.journey.update);
    app.post('/api/journey/cancel', auth.requiresLogin, controllers.journey.cancel);
    app.post('/api/journey/confirm', auth.requiresLogin, controllers.journey.confirm, controllers.participate.notify);
    app.get('/api/journey/open', controllers.journey.openList);
	app.get('/api/journey/:id', controllers.journey.detail);
    app.get('/api/journey/run/:id', controllers.journey.listForRun);
    app.get('/api/journey/next/:nb', controllers.journey.next);
    app.get('/api/journey/book/:id', controllers.journey.bookSpace);

    app.post('/api/discussion/private/message', auth.requiresLogin, controllers.discussion.addPrivateMessage);
    app.post('/api/discussion/public/message', controllers.discussion.addPublicMessage);
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
    app.get('/api/participate/user/list', auth.requiresLogin, controllers.participate.userList);
    app.get('/api/participate/run/user/list/:id', auth.requiresLogin, controllers.participate.userRunList);

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
	app.post('/api/admin/page', auth.requireAdmin, controllers.page.save);
	app.get('/api/admin/pages', auth.requireAdmin, controllers.page.getList);
	app.get('/api/admin/user/bankaccount/:id', auth.requireAdmin, controllers.bank_account.getByUser);
    app.post('/api/admin/journey/payed', auth.requireAdmin, controllers.journey.togglePayed);

    app.get('/api/page/:tag', controllers.page.getByTag);

    app.get('/api/invoice', auth.requiresLogin, controllers.invoice.getByUser);
    app.get('/api/invoice/driver', auth.requiresLogin, controllers.invoice.getByDriver);
	
	app.post('/api/user/bankaccount', auth.requiresLogin, controllers.bank_account.save);
	app.get('/api/user/bankaccount', auth.requiresLogin, controllers.bank_account.get);

    app.post('/api/paypal/ipn', controllers.invoice.confirm, controllers.journey.notifyJoin);
	
    app.get('/partials/:name', controllers.root.partials);

	// For technical purpose
	app.get('/sync', controllers.root.sync);
	
    // redirect all others to the index (HTML5 history)
    app.get('*', controllers.root.default);
};