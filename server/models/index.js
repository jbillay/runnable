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
var q = require('q');
var async = require('async');

console.log('Init Database');

sequelize
  .authenticate()
  .then(function(err) {
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

db.loadData = function (fix) {
    var deferred = q.defer();
    db[fix.model].create(fix.data)
        .then(function (result) {
            return deferred.resolve(result);
        })
        .catch(function (err) {
            return deferred.reject('error ' + err);
        });
    return deferred.promise;
};

db.loadFixture = function (done) {
    db.sequelize.sync({force: true})
        .then(function () {
            async.waterfall([
                function(callback) {
                    var fixtures = require('../../test/api/fixtures/users.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function() {
                        callback(null);
                    });
                },
                function(callback) {
                    var fixtures = require('../../test/api/fixtures/bankAccount.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function() {
                        callback(null);
                    });
                },
                function (callback) {
                    var fixtures = require('../../test/api/fixtures/runs.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function () {
                        callback(null);
                    });
                },
                function (callback) {
                    var fixtures = require('../../test/api/fixtures/journeys.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function () {
                        callback(null);
                    });
                },
                function (callback) {
                    var fixtures = require('../../test/api/fixtures/joins.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function () {
                        callback(null);
                    });
                },
                function (callback) {
                    var fixtures = require('../../test/api/fixtures/invoices.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function () {
                        callback(null);
                    });
                },
                function (callback) {
                    var fixtures = require('../../test/api/fixtures/inboxes.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function () {
                        callback(null);
                    });
                },
                function (callback) {
                    var fixtures = require('../../test/api/fixtures/discussions.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function () {
                        callback(null);
                    });
                },
                function (callback) {
                    var fixtures = require('../../test/api/fixtures/participates.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function () {
                        callback(null);
                    });
                },
                function(callback) {
                    var fixtures = require('../../test/api/fixtures/validationJourneys.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function() {
                        callback(null);
                    });
                },
                function(callback) {
                    var fixtures = require('../../test/api/fixtures/options.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function() {
                        callback(null);
                    });
                },
                function(callback) {
                    var fixtures = require('../../test/api/fixtures/pages.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function() {
                        callback(null);
                    });
                },
                function(callback) {
                    var fixtures = require('../../test/api/fixtures/partner.json');
                    var promises = [];
                    fixtures.forEach(function (fix) {
                        promises.push(db.loadData(fix));
                    });
                    q.all(promises).then(function() {
                        callback(null);
                    });
                }
            ], function (err, result) {
                done();
            });
        });
};

module.exports = db;
