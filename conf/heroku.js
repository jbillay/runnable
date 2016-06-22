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
    cloudinary  : {
        cloud_name: 'myruntrip',
        api_key: '511661424693833',
        api_secret: 'K_K_qK7njgwSDvpTExVnuBfayCM'
    },
    google: {
        api_key: 'AIzaSyCJBxFMWVQIyr1WP9HVcRHvYJI0MKaVDrs'
    },
    port        : process.env.PORT || 9615,
    domain      : 'localhost:9615',
    timeout     : 6000
};