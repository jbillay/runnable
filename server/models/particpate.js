/**
 * Created by jeremy on 25/01/15.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Participate = sequelize.define('Participate', {
    }, {
        classMethods: {
            associate: function(models) {
                Participate.belongsTo(models.Run),
                Participate.belongsTo(models.User);
            }
        }
    });
    return Participate;
};