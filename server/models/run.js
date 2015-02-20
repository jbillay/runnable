/**
 * Created by jeremy on 15/08/2014.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
	var Run = sequelize.define('Run', {
		name:			DataTypes.STRING,
		type: 			{ type: DataTypes.ENUM, values: ['trail', 'ultra', '10k', '20k', 'semi', 'marathon'] },
		address_start:	DataTypes.STRING,
		date_start: 	DataTypes.DATE,
		time_start: 	DataTypes.STRING,
		distances: 		DataTypes.STRING,
		elevations: 	DataTypes.STRING,
		info: 			DataTypes.TEXT,
		is_active:		{ type: DataTypes.BOOLEAN, defaultValue: true }
	}, {
		classMethods: {
			associate: function(models) {
				Run.belongsTo(models.User),
				Run.hasMany(models.Journey);
			},
			isActive: function() {
				return this.isActive;
			}
		}
	});
  return Run;
};
