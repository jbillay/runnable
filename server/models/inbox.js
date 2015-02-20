/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Inbox = sequelize.define('Inbox', {
		title:	 DataTypes.TEXT,
		message: DataTypes.TEXT,
		is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        classMethods: {
            associate: function(models) {
                Inbox.belongsTo(models.User);
            }
        }
    });
    return Inbox;
};
