/**
 * Created by jeremy on 15/08/2014.
 */

var orm       = require('orm');

module.exports = function (db) {
    "use strict";
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