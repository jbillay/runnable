/**
 * Created by jeremy on 15/08/2014.
 */

var orm       = require('orm');

module.exports = function (db) {
    "use strict";
	console.log('Loading models journey');
    var Journey = db.define("journey",
        {
			address_start:		{ type: 'text', required: true },
			distance:			String, // Not yet implemented
			duration:			String, // Not yet implemented
            date_start: 		{ type: 'date', required: true, time: false },
			time_start:			String, // to check which format is the most accurate
			car_type: 			[ "citadine", "berline", "break", "monospace", "suv", "coupe", "cabriolet" ],
			nb_space:			Number,
			amount:				Number,
			owner_id:			Number,
			createdAt:			{ type: 'date', required: true, time: true }
        },	{
			hooks: {
				beforeValidation: function () {
					this.createdAt = new Date();
				}
			}
		}, {
			methods: {
				isOwner: function(id) {
					return this.owner_id === id;
				}
            }
        }
	);

	Journey.hasOne('run', db.models.run, { required: true, reverse: 'journeys', autoFetch: true });
	
	return Journey;
};