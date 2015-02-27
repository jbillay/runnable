/**
 * Created by jeremy on 15/08/2014.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
	var Journey = sequelize.define('Journey', {
		address_start:		{ type: DataTypes.STRING, allowNull: false },
		distance: 			DataTypes.STRING,
		duration: 			DataTypes.STRING,
		journey_type:		{ type: DataTypes.ENUM, values: ['aller-retour', 'aller', 'retour'] },
		date_start_outward:	DataTypes.DATE,
		time_start_outward: DataTypes.STRING,
		nb_space_outward: 	DataTypes.INTEGER,
		date_start_return:	DataTypes.DATE,
		time_start_return:	DataTypes.STRING,
		nb_space_return:	DataTypes.INTEGER,
		car_type: 			{ type: DataTypes.ENUM, values: ['citadine', 'berline', 'break', 'monospace', 'suv', 'coupe', 'cabriolet'] },
		amount: 			DataTypes.FLOAT
	}, {
		classMethods: {
			associate: function(models) {
                /*jshint -W030 */
				Journey.belongsTo(models.Run),
				Journey.belongsTo(models.User),
				Journey.hasMany(models.Join);
                /*jshint +W030 */
			}
		}
	});
  return Journey;
};
