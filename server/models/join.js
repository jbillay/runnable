/**
 * Created by jeremy on 15/08/2014.
 */

module.exports = function(sequelize, DataTypes) {
    "use strict";
	var Join = sequelize.define("Join", {
		nb_place: DataTypes.INTEGER,
		status:	{ 
			type: DataTypes.ENUM, 
			values: ['pending', 'payed', 'cancelled', 'refused', 'done'],
			defaultValue: 'pending'
			},
	}, {
		classMethods: {
			associate: function(models) {
				Join.belongsTo(models.User),
				Join.belongsTo(models.Journey)
			}
		}
	});
  return Join;
};
