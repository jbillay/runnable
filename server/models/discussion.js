/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Discussion = sequelize.define('Discussion', {
        message: DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                Discussion.belongsTo(models.User),
                Discussion.belongsTo(models.Journey);
            }
        }
    });
    return Discussion;
};
