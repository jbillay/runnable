/**
 * Created by jeremy on 14/08/2014.
 */

'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var settings  = require('../../conf/config');
var sequelize = new Sequelize(settings.database.database, settings.database.user, settings.database.password, settings.database);
var db        = {};

console.log('Init Database');

sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
	  console.log('Unable to connect to the database: Exiting.' + err);
	  process.exit(0);
    } else {
      console.log('Connection has been established successfully.');
    }
  });

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
	console.log(model.name + ' model loaded');
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
	console.log(modelName + ' model association done');
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('Database loaded !');

module.exports = db;
