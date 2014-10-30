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
	fs.readdirSync(path.join(__dirname))
		.filter(function(file) {
			return (file.indexOf('.') !== 0) && (file !== 'index.js')
	})
	.forEach(function(file) {
		var name = file.slice(0,-3);
		console.log('Loading models ' + name);
		db.models[name] = require('./' + name)(db);
	});
	global.db = db;
	console.log('Database loaded !');
});

module.exports = db;