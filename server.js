/**
 * Module dependencies.
 */

/*jslint node:true */

var express = require('express');
var settings = require('./conf/config');
require('console-stamp')(console, '[dd/mm/yy - HH:MM:ss.l]');
var passport = require('./server/passport');
var auth = require('./server/authorization');

var app = express();

// Init Express
require('./server/express')(app, passport);

// Init Routes
require('./server/routes')(app, passport, auth);

var server = app.listen(settings.port, function () {
    "use strict";
    console.log(("Listening on port " + settings.port));
}).on('error', function (e) {
    "use strict";
    if (e.code === 'EADDRINUSE') {
        console.log('Address in use. Is the server already running?');
    }
});

// Init Socket.io
require('./server/socket')(server);

//expose app
exports = module.exports = app;
