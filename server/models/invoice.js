/**
 * Created by jeremy on 21/02/15.
 */
/**
 * Created by jeremy on 15/08/2014.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Invoice = sequelize.define('Invoice', {
        status:	{
            type: DataTypes.ENUM,
            values: ['pending', 'completed', 'cancelled', 'refused', 'done'],
            defaultValue: 'pending'
        },
        amount: DataTypes.FLOAT,
        fees: DataTypes.FLOAT,
        ref: DataTypes.STRING,
        transaction : DataTypes.STRING,
        driver_payed: DataTypes.BOOLEAN
    }, {
        classMethods: {
            associate: function(models) {
                Invoice.belongsTo(models.User);
                Invoice.belongsTo(models.Journey);
                Invoice.belongsTo(models.Join);
            }
        }
    });
    return Invoice;
};
