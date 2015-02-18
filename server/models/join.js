/**
 * Created by jeremy on 15/08/2014.
 */

module.exports = function(sequelize, DataTypes) {
    "use strict";
	var Join = sequelize.define("Join", {
		nb_place_outward: DataTypes.INTEGER,
		nb_place_return: DataTypes.INTEGER,
		status:	{ 
			type: DataTypes.ENUM, 
			values: ['pending', 'complete', 'cancelled', 'refused', 'done'],
			defaultValue: 'pending'
			},
		amount: DataTypes.FLOAT,
		invoice: DataTypes.STRING,
		transaction : DataTypes.STRING
	}, {
		classMethods: {
			associate: function(models) {
				Join.belongsTo(models.User),
				Join.belongsTo(models.Journey),
                Join.hasMany(models.ValidationJourney)
			}
		}
	});
  return Join;
};
