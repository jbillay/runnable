/**
 * Created by jeremy on 23/11/14.
 */

var path       = require('path');

module.exports = {
    path        : path.normalize(path.join(__dirname, '..')),
    name		: 'Runnable',
    port        : process.env.NODE_PORT || 9615,
    domain      : 'localhost:9615'
};