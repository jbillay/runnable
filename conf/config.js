/**
 * Created by jeremy on 29/04/2014.
 */

/*jslint node: true */

var _ = require('lodash');

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

console.log('Load environment ' + process.env.NODE_ENV + ' configuration');

module.exports = _.extend(
    require('./all'),
    require('./' + process.env.NODE_ENV)
);
