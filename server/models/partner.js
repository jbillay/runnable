/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Partner = sequelize.define('Partner', {
        name:   DataTypes.STRING,
        token:  DataTypes.TEXT,
        expiry: DataTypes.DATE,
        fee:    DataTypes.FLOAT
    }, {
        classMethods: {
            associate: function(models) {
                /*jshint -W030 */
                Partner.belongsTo(models.User);
                /*jshint +W030 */
            }
        }
    });
    return Partner;
};
