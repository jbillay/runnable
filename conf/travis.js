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
    port        : process.env.NODE_PORT || 9615,
    domain      : 'localhost:9615'
};