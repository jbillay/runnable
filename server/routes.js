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
    app.post('/login', passport.authenticate('local',
            {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })
    );
	app.post('/api/user', controllers.user.create);
    app.get('/api/active/:id/:hash', controllers.user.active);
	app.get('/api/user/me', auth.requiresLogin, controllers.user.me);
    app.get('/api/user/runs', auth.requiresLogin, controllers.user.showRuns);
    app.get('/api/user/journeys', auth.requiresLogin, controllers.user.showJourneys);
    app.get('/api/user/joins', auth.requiresLogin, controllers.user.showJoins);

    app.post('/api/run', auth.requiresLogin, controllers.run.create);
    app.get('/api/run/list', controllers.run.list);
    app.get('/api/run/:id', controllers.run.detail);
    app.get('/api/run/next/:nb', controllers.run.next);

    app.post('/api/journey', auth.requiresLogin, controllers.journey.create);
    app.get('/api/journey/list', controllers.journey.list);
	app.get('/api/journey/:id', controllers.journey.detail);
    app.get('/api/journey/run/:id', controllers.journey.listForRun);
    app.get('/api/journey/next/:nb', controllers.journey.next);

    app.post('/api/join', auth.requiresLogin, controllers.join.create);
	app.get('/api/join/:id', auth.requiresLogin, controllers.join.detail);
    app.get('/api/join/journey/:id', controllers.join.listForJourney);
	app.get('/api/join/remove/:id', auth.requiresLogin, controllers.join.remove);

    app.get('/partials/:name', controllers.root.partials);

	// For technical purpose
	app.get('/sync', controllers.root.sync);
	
    // redirect all others to the index (HTML5 history)
    app.get('*', controllers.root.default);
};