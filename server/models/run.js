/**
 * Created by jeremy on 15/08/2014.
 */

module.exports = function(sequelize, DataTypes) {
    "use strict";
	var Run = sequelize.define("Run", {
		name:			DataTypes.STRING,
		type: 			{ type: DataTypes.ENUM, values: ['trail', 'ultra', '10k', '20k', 'semi', 'marathon'] },
		address_start:	DataTypes.STRING,
		date_start: 	DataTypes.STRING,
		time_start: 	DataTypes.STRING,
		distances: 		DataTypes.STRING,
		elevations: 	DataTypes.STRING,
		info: 			DataTypes.TEXT,
		is_active:		{ type: DataTypes.BOOLEAN, defaultValue: false }
	}, {
		classMethods: {
			associate: function(models) {
				Run.belongsTo(models.User),
				Run.hasMany(models.Journey)
			},
			isActive: function() {
				return this.isActive;
			}
		}
	});
  return Run;
};

/*
 ** Node ORM version

var orm       = require('orm');

module.exports = function (db) {
    "use strict";
	console.log('Loading models run');
    var Run = db.define("run",
        {
			name: 				String,
			type: 				[ "trail", "ultra", "10k", "20k", "semi", "marathone" ],
			address_start:		String,
            date_start: 		String,
			time_start:			String,
			distances:	 		String,
			elevations: 		String,
			info:				String,
			is_active:			Boolean,
			owner_id:			Number
        }, {
            methods: {
				isActive: function() {
					return this.isActive;
				}
            }
        }
	);
	return Run;
};
*/