/**
 * Created by jeremy on 14/08/2014.
 */

var controllers = require('./controllers').init();

module.exports = function (app, passport, auth) {
    "use strict";
	console.log('Init Routes');
    // serve index and view partials
    app.get('/', controllers.root.index);
    app.get('/logout', controllers.root.logout);
    app.get('/login', controllers.root.login);
    app.post('/login', passport.authenticate('local',
            {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: true
        })
    );
	app.post('/user', controllers.user.create);
	app.get('/user/me', auth.requiresLogin, controllers.user.me);

    app.post('/run', auth.requiresLogin, controllers.run.create);
    app.get('/run/list', auth.requiresLogin, controllers.run.list);
    app.get('/run/:id', auth.requiresLogin, controllers.run.detail);

    app.post('/journey', auth.requiresLogin, controllers.journey.create);
    app.get('/journey/list', auth.requiresLogin, controllers.journey.list);
	app.get('/journey/:id', auth.requiresLogin, controllers.journey.detail);
    app.get('/journey/run/:id', auth.requiresLogin, controllers.journey.listForRun);

    app.post('/join', auth.requiresLogin, controllers.join.create);
	app.get('/join/:id', auth.requiresLogin, controllers.join.detail);
    app.get('/join/journey/:id', auth.requiresLogin, controllers.join.listForJourney);
	app.get('/join/remove/:id', auth.requiresLogin, controllers.join.remove);

	app.get('/follow/me', auth.requiresLogin, controllers.follow.me);
	app.get('/follow/me/resume', auth.requiresLogin, controllers.follow.meResume);
	app.get('/follow/add/:type/:id', auth.requiresLogin, controllers.follow.add);
	app.get('/follow/remove/:type/:id', auth.requiresLogin, controllers.follow.remove);
	
    app.get('/partials/:name', auth.requiresLogin, controllers.root.partials);

	// For technical purpose
	app.get('/sync', controllers.root.sync);
	
    // redirect all others to the index (HTML5 history)
    app.get('*', controllers.root.default);
};