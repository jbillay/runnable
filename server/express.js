/**
 * Created by jeremy on 14/08/2014.
 */

var path     = require('path');
var express  = require('express');
var flash = require('connect-flash');
var jwt = require('jsonwebtoken');

module.exports = function (app, passport) {
	'use strict';
	console.log('Init Express');
	
    app.set('showStackError', true);    
    
	//Prettify HTML
    app.locals.pretty = true;

    //Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    //Setting the fav icon and static folder
    app.use(express.favicon());
    app.use(express.static(path.join(__dirname, '../public')));

    //Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'));
    }

    //Set views path, template engine and default layout
    app.set('views', path.join(__dirname, '../public/views'));
    app.engine('html', require('ejs').renderFile);
	app.set('view engine', 'html');

    //Enable jsonp
    app.enable('jsonp callback');

    app.configure(function () {
        //cookieParser should be above session
        app.use(express.cookieParser());

        // request body parsing middleware should be above methodOverride
        app.use(express.urlencoded({limit: '50mb'}));
        app.use(express.json({limit: '50mb'}));
        app.use(express.methodOverride());

        //express/mongo session storage
        app.use(express.session({ secret: 'Runn@ble$uper$ecret'}));

        //connect flash for flash messages
        app.use(flash());

        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        app.use(function(req, res, next) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'];
            if (token) {
                // verifies secret and checks exp
                jwt.verify(token, 'secretTokenKey4MyRunTrip$', function (err, decoded) {
                    if (err) {
                        return res.json(403, {success: false, message: 'Failed to authenticate token.'});
                    } else {
                        // if everything is good, save to request for use in other routes
                        if (decoded.partner) {
                            req.partner = decoded.partner;
                        }
                        req.logIn(decoded.user, function(err) {
                            if (err) { return next(err); }
                            next();
                        });
                    }
                });
            } else {
                next();
            }
        });

        //routes should be at the last
        app.use(app.router);

        //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
        app.use(function(err, req, res, next) {
            //Treat as 404
            if (~err.message.indexOf('not found')) return next();
            //Log it
            console.error(err.stack);
            //Error page
            res.status(500).render('500.html', {
                error: err.stack
            });
        });

        //Assume 404 since no middleware responded
        app.use(function(req, res, next) {
            res.status(404).render('404.html', {
                url: req.originalUrl,
                error: 'Not found'
            });
        });
    });
};
