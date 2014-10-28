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

    app.get('/partials/:name', auth.requiresLogin, controllers.root.partials);

	// For technical purpose
	app.get('/sync', controllers.root.sync);
	
    // redirect all others to the index (HTML5 history)
    app.get('*', controllers.root.default);
};