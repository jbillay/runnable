/**
 * Created by jeremy on 23/11/14.
 */

// DATABASE MYSQL
// b8428e9db543c6:198ddf5a@eu-cdbr-west-01.cleardb.com/heroku_3ab073091e3a305?reconnect=true

'use strict';

module.exports = {
    database    : {
        protocol    : 'mysql',
        query       : { pool: true },
        host        : 'eu-cdbr-west-01.cleardb.com',
        database    : 'heroku_3ab073091e3a305',
        user        : 'b8428e9db543c6',
        password    : '198ddf5a',
        port        : 3306
    },
    port        : process.env.NODE_PORT || 9615,
    domain      : 'localhost:9615',
    timeout     : 6000
};