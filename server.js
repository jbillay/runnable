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

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

// Init Express
require('./server/express')(app, passport);

// Init Routes
require('./server/routes')(app, passport, auth);

// Socket.io Communication
io.sockets.on('connection', require('./server/socket'));

server.listen(settings.port, function () {
    "use strict";
    console.log(("Listening on port " + settings.port));
}).on('error', function (e) {
    "use strict";
    if (e.code === 'EADDRINUSE') {
        console.log('Address in use. Is the server already running?');
    }
});

//expose app
exports = module.exports = app;
