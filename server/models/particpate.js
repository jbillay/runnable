/**
 * Created by jeremy on 25/01/15.
 */

module.exports = function(sequelize, DataTypes) {
    "use strict";
    var Participate = sequelize.define("Participate", {
    }, {
        classMethods: {
            associate: function(models) {
                Participate.belongsTo(models.Run),
                Participate.belongsTo(models.User)
            }
        }
    });
    return Participate;
};