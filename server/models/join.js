/**
 * Created by jeremy on 15/08/2014.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
	var Join = sequelize.define('Join', {
		nb_place_outward: DataTypes.INTEGER,
		nb_place_return: DataTypes.INTEGER
	}, {
		classMethods: {
			associate: function(models) {
				Join.belongsTo(models.User),
				Join.belongsTo(models.Journey),
				Join.hasOne(models.Invoice),
                Join.hasMany(models.ValidationJourney);
			}
		}
	});
  return Join;
};
