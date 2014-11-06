/**
 * Created by jeremy on 15/08/2014.
 */

 
module.exports = function(sequelize, DataTypes) {
    "use strict";
	var Journey = sequelize.define("Journey", {
		address_start:	{ type: DataTypes.STRING, allowNull: false },
		distance: 		DataTypes.STRING,
		duration: 		DataTypes.STRING,
		date_start: 	DataTypes.STRING,
		time_start: 	DataTypes.STRING,
		car_type: 		{ type: DataTypes.ENUM, values: ['citadine', 'berline', 'break', 'monospace', 'suv', 'coupe', 'cabriolet'] },
		nb_space: 		DataTypes.INTEGER,
		amount: 		DataTypes.FLOAT
	}, {
		classMethods: {
			associate: function(models) {
				Journey.belongsTo(models.Run),
				Journey.belongsTo(models.User),
				Journey.hasMany(models.Join)
			}
		}
	});
  return Journey;
};
