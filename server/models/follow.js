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
