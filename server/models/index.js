/**
 * Created by jeremy on 14/08/2014.
 */

var fs        = require('fs');
var path      = require('path');
var orm       = require('orm');
var settings  = require('../../conf/config');
global.db        = {};

console.log('Init Database');

orm.connect(settings.database, function (err, db) {
	if (err) {
		throw new Error('Problem with database connection : ' + err);
	}
	db.settings.set('instance.returnAllErrors', true);
	db.models['run'] = require('./run')(db);
	db.models['users'] = require('./users')(db);
	db.models['follow'] = require('./follow')(db);
	db.models['journey'] = require('./journey')(db);
	global.db = db;
	console.log('Database loaded !');
});

module.exports = db;