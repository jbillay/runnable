/**
 * Created by jeremy on 14/08/2014.
 */

var controllers = require('./controllers').init();

module.exports = function (app, passport, auth) {
    "use strict";
	console.log('Init Routes');
    // serve index and view partials
    app.get('/', controllers.root.default);
    app.get('/logout', controllers.root.logout);
    app.get('/login', controllers.root.login);
	app.post('/login', passport.authenticate('local'), controllers.root.auth);
	app.post('/api/send/mail', controllers.root.sendMail);

    app.get('/api/home/feedback', controllers.home.userFeedback);

	app.post('/api/user', controllers.user.create);
	app.post('/api/user/password/reset', controllers.user.resetPassword);
	app.post('/api/user/password/update', controllers.user.updatePassword);
	app.post('/api/user/invite', controllers.user.invite);
    app.get('/api/user/active/:id/:hash', controllers.user.active);
    app.get('/api/user/:id/:hash', controllers.user.active);
	app.get('/api/user/me', auth.requiresLogin, controllers.user.me);
    app.get('/api/user/runs', auth.requiresLogin, controllers.user.showRuns);
    app.get('/api/user/journeys', auth.requiresLogin, controllers.user.showJourneys);
    app.get('/api/user/joins', auth.requiresLogin, controllers.user.showJoins);
    app.get('/api/user/public/info/:id', controllers.user.publicInfo);
    app.get('/api/user/public/driver/:id', controllers.user.publicDriverInfo);
    app.get('/api/user/runs/:id', controllers.user.showRuns);
    
    app.post('/api/run', auth.requiresLogin, controllers.run.create);
    app.get('/api/run/list', controllers.run.activeList);
    app.get('/api/run/:id', controllers.run.detail);
    app.get('/api/run/next/:nb', controllers.run.next);

    app.post('/api/journey', auth.requiresLogin, controllers.journey.create);
    app.get('/api/journey/list', controllers.journey.list);
	app.get('/api/journey/:id', controllers.journey.detail);
    app.get('/api/journey/run/:id', controllers.journey.listForRun);
    app.get('/api/journey/next/:nb', controllers.journey.next);

    app.post('/api/discussion/message', auth.requiresLogin, controllers.discussion.addMessage);
    app.get('/api/discussion/users/:id', auth.requiresLogin, controllers.discussion.getUsers);
    app.get('/api/discussion/messages/:id', auth.requiresLogin, controllers.discussion.getMessages);

    app.post('/api/validation', auth.requiresLogin, controllers.validation_journey.validate);

    app.post('/api/inbox/msg', auth.requiresLogin, controllers.inbox.add);
    app.post('/api/inbox/msg/read', auth.requiresLogin, controllers.inbox.read);
    app.post('/api/inbox/msg/unread', auth.requiresLogin, controllers.inbox.unread);
    app.get('/api/inbox/msg', auth.requiresLogin, controllers.inbox.getList);
    app.get('/api/inbox/msg/:id', auth.requiresLogin, controllers.inbox.get);
    app.get('/api/inbox/unread/nb/msg', auth.requiresLogin, controllers.inbox.countUnread);

    app.post('/api/join', auth.requiresLogin, controllers.join.create);
	app.get('/api/join/:id', auth.requiresLogin, controllers.join.detail);
    app.get('/api/join/journey/:id', controllers.join.listForJourney);
	app.get('/api/join/remove/:id', auth.requiresLogin, controllers.join.remove);

    app.post('/api/participate/add', auth.requiresLogin, controllers.participate.add);
    app.get('/api/participate/user/list', auth.requiresLogin, controllers.participate.userList);
    app.get('/api/participate/run/list/:id', auth.requiresLogin, controllers.participate.runList);

	app.get('/api/admin/users', auth.requireAdmin, controllers.user.list);
	app.get('/api/admin/runs', auth.requireAdmin, controllers.run.list);
	app.get('/api/admin/joins', auth.requireAdmin, controllers.join.list);
	app.post('/api/admin/run/active', auth.requireAdmin, controllers.run.toggleActive);
	app.post('/api/admin/user/active', auth.requireAdmin, controllers.user.toggleActive);

    app.get('/partials/:name', controllers.root.partials);

	// For technical purpose
	app.get('/sync', controllers.root.sync);
	
    // redirect all others to the index (HTML5 history)
    app.get('*', controllers.root.default);
};