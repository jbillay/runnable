/**
 * Created by jeremy on 15/08/2014.
 */

var orm       = require('orm');

module.exports = function (db) {
    "use strict";
    var Follow = db.define("follow",
        {
			owner_id:			Number,
			type:				String,
			type_id:			Number
        }, {
            methods: {
				getMyFollow: function(id) {
					return this.owner_id === id;
				}
            }
        }
	);
	return Follow;
};