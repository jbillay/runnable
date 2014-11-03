/**
 * Created by jeremy on 14/08/2014.
 */

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var settings  = require('../../conf/config');
var sequelize = new Sequelize(settings.database.database, settings.database.user, settings.database.password, settings.database);
var db        = {};

console.log('Init Database');

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
	console.log(model.name + ' model loaded');
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
	console.log(modelName + ' model association done');
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('Database loaded !');

module.exports = db;

/*
** Node ORM version

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
*/