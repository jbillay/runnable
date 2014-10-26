/**
 * Created by jeremy on 29/04/2014.
 */

/*jslint node: true */

var path       = require('path');

var settings = {
    path        : path.normalize(path.join(__dirname, '..')),
	name		: 'Runnable',
    port        : process.env.NODE_PORT || 9615,
    env         : 'DEV',
    database    : {
        protocol    : "mysql",
        query       : { pool: true },
        host        : "localhost",
        database    : "runnable",
        user        : "root",
        password    : "root",
        port        : 3306
    }
};

module.exports = settings;
