/**
 * Created by jeremy on 15/08/2014.
 */

var orm       = require('orm');

module.exports = function (db) {
    "use strict";
    var Run = db.define("journey",
        {
			run_id:				Number,
			address_start:		String,
			distance:			String,
			duration:			String,
            date_start: 		String,
			time_start:			String,
			car_type: 			[ "citadine", "berline", "break", "monospace", "suv", "coupe", "cabriolet" ],
			nb_space:			Number,
			amount:				Number,
			owner_id:			Number
        }, {
            methods: {
				isOwner: function(id) {
					return this.owner_id === id;
				}
            }
        }
	);
	return Run;
};