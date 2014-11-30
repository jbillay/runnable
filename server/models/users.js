/**
 * Created by jeremy on 15/08/2014.
 */

"use strict";

var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    "use strict";
	var User = sequelize.define("User", {
		firstname:		DataTypes.STRING,
		lastname: 		DataTypes.STRING,
		address:		DataTypes.STRING,
		email: 			{ type: DataTypes.STRING, unique: true, allowNull: false },
		password: 		{ type: DataTypes.STRING, allowNull: false },
		hashedPassword: DataTypes.STRING,
		provider: 		DataTypes.STRING,
		salt: 			DataTypes.STRING,
		itra:			DataTypes.STRING,
		isActive:		{ type: DataTypes.BOOLEAN, defaultValue: false },
		isAdmin:		{ type: DataTypes.BOOLEAN, defaultValue: false }
	}, {
		classMethods: {
			associate: function(models) {
				User.hasMany(models.Run),
				User.hasMany(models.Journey)
			}
		},
		instanceMethods: {
			validPassword: function (password) {
				return this.password === password;
			},
			makeSalt: function () {
				return crypto.randomBytes(16).toString('base64'); 
			},
			authenticate: function (plainText){
				if (!this.isActive) return false;
				return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
			},
			encryptPassword: function (password, salt) {
				if (!password || !salt) return '';
				salt = new Buffer(salt, 'base64');
				return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
			}
		}
	});
  return User;
};
