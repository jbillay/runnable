/**
 * Created by jeremy on 15/08/2014.
 */

 var orm       = require('orm');

module.exports = function (db) {
    "use strict";
    var Users = db.define("users",
        {
			firstname: 		String,
			lastname: 		String,
			address:		String,
            email: {
				type: 'text',
				unique: true
			},
            password: 		String,
			hashedPassword: String,
			provider: 		String,
			salt: 			String, 
			facebookUserId: Number,
			twitterUserId: 	Number,
			twitterKey: 	String,
			twitterSecret: 	String,
			github: 		String,
			openId: 		String
        }, {
            methods: {
				makeSalt: function() {
					return crypto.randomBytes(16).toString('base64'); 
				},
				authenticate: function(plainText){
					return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
				},
				encryptPassword: function(password, salt) {
					if (!password || !salt) return '';
					salt = new Buffer(salt, 'base64');
					return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
				},
                validPassword: function (password) {
                    return this.password === password;
                }
            }
        }
	);
	return Users;
};