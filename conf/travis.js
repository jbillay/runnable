/**
 * Created by jeremy on 23/11/14.
 */

'use strict';

module.exports = {
    database    : {
        dialect     : "sqlite",
        storage     : './database.sqlite',
        logging     : false
    },
    cloudinary  : {
        cloud_name: 'myruntrip',
        api_key: '511661424693833',
        api_secret: 'K_K_qK7njgwSDvpTExVnuBfayCM'
    },
    google: {
        api_key: 'AIzaSyCJBxFMWVQIyr1WP9HVcRHvYJI0MKaVDrs'
    },
    port        : process.env.NODE_PORT || 9615,
    domain      : 'localhost:9615',
    timeout     : 10000
};