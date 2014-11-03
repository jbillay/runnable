/**
 * Created by jeremy on 15/08/2014.
 */

 module.exports = function(sequelize, DataTypes) {
    "use strict";
	var Follow = sequelize.define("Follow", {
		type: 		{ type: DataTypes.ENUM, values: ['user', 'run', 'journey'] },
		type_id: 	DataTypes.INTEGER
	}, {
		classMethods: {
			associate: function(models) {
				Follow.belongsTo(models.User)
			}
		}
	});
  return Follow;
};

/*
** Node ORM version
 
var orm       = require('orm');

module.exports = function (db) {
    "use strict";
	console.log('Loading models follow');
    var Follow = db.define("follow",
        {
			owner_id:			Number,
			type:				String,
			type_id:			Number
        }, {
            methods: {
				getMyFollow: function(id) {
					return this.owner_id === id;
				}
            }
        }
	);
	return Follow;
};
*/