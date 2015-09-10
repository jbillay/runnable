/**
 * Created by jeremy on 15/08/2014.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
	var Run = sequelize.define('Run', {
		name:			DataTypes.STRING,
		slug:			DataTypes.STRING,
		type: 			{ type: DataTypes.ENUM, values: ['trail', 'ultra', '10k', '20k', 'semi', 'marathon', 'triathlon'] },
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
                /*jshint -W030 */
				Run.belongsTo(models.User),
				Run.hasMany(models.Journey);
                /*jshint +W030 */
			}
		}
	});
  return Run;
};
