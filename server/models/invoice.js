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
            values: ['pending', 'completed', 'cancelled', 'refused', 'refunded', 'done'],
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
                /*jshint -W030 */
                Invoice.belongsTo(models.User);
                Invoice.belongsTo(models.Journey);
                Invoice.belongsTo(models.Join);
                /*jshint +W030 */
            }
        }
    });
    return Invoice;
};
