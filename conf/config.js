/**
 * Created by jeremy on 29/04/2014.
 */

/*jslint node: true */

var _ = require('lodash');

/*
 NOT REQUIRED AS IT IS IMPOSSIBLE TO CHECK NODE_ENV VALUE IN IF
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}
 */

console.log('Load environment ' + process.env.NODE_ENV + ' configuration');

module.exports = _.extend(
    require('./all'),
    require('./' + process.env.NODE_ENV)
);
