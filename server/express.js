/**
 * Created by jeremy on 14/08/2014.
 */

var path     = require('path');
var express  = require('express');
var flash = require('connect-flash');
var multer = require('multer');
var Options = require('./objects/option');
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
        app.use(express.urlencoded());
        app.use(express.json());
        app.use(express.methodOverride());

        //express/mongo session storage
        app.use(express.session({ secret: 'Runn@ble$uper$ecret'}));

        //connect flash for flash messages
        app.use(flash());

        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        // Directory to save uploaded files
        app.use(multer({ dest: path.join(__dirname, '../public/uploads/'),
            changeDest: function (dest, req) {
                if (req.path.match(/^\/api\/user\/.+/)) {
                    dest = dest + '/users';
                } else if (req.path.match(/^\/api\/run\/.+/)) {
                    dest = dest + '/runs';
                }
                console.log(dest);
                return dest;
            },
            rename: function (fieldname, filename, req) {
                return 'avatar_' + req.user.id;
            },
            onFileUploadStart: function (file) {
                console.log(file.originalname + ' is starting ...');
            },
            onFileUploadComplete: function (file) {
                console.log(file.fieldname + ' uploaded to  ' + file.path);
            },
            onParseStart: function() {
                console.log('Starting to parse request!');
            },
            onParseEnd: function(req, next) {
                console.log('Done parsing!');
                next();
            },
            onError: function(e, next) {
                if (e) {
                    console.log(e.stack);
                }
                next();
            }
        }));

        app.use(function(req, res, next) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'];
            if (token) {
                // verifies secret and checks exp
                jwt.verify(token, 'secretTokenKey4MyRunTrip$', function (err, decoded) {
                    if (err) {
                        return res.json({success: false, message: 'Failed to authenticate token.'});
                    } else {
                        // if everything is good, save to request for use in other routes
                        req.logIn(decoded, function(err) {
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
