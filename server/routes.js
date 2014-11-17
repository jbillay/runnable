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
	app.post('/user', controllers.user.create);
	app.get('/user/me', auth.requiresLogin, controllers.user.me);

    app.post('/run', controllers.run.create);
    app.get('/run/list', controllers.run.list);
    app.get('/run/:id', controllers.run.detail);

    app.post('/journey', controllers.journey.create);
    app.get('/journey/list', controllers.journey.list);
	app.get('/journey/:id', controllers.journey.detail);
    app.get('/journey/run/:id', controllers.journey.listForRun);

    app.post('/join', auth.requiresLogin, controllers.join.create);
	app.get('/join/:id', auth.requiresLogin, controllers.join.detail);
    app.get('/join/journey/:id', auth.requiresLogin, controllers.join.listForJourney);
	app.get('/join/remove/:id', auth.requiresLogin, controllers.join.remove);

    app.get('/partials/:name', controllers.root.partials);

	// For technical purpose
	app.get('/sync', controllers.root.sync);
	
    // redirect all others to the index (HTML5 history)
    app.get('*', controllers.root.default);
};