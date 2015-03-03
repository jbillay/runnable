/**
 * Created by jeremy on 03/03/15.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var bankAccount = sequelize.define('BankAccount', {
        owner:     		DataTypes.TEXT,
        agency_name:    DataTypes.TEXT,
        IBAN:		    DataTypes.TEXT,
        BIC:       		DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                /*jshint -W030 */
                bankAccount.belongsTo(models.User);
                /*jshint +W030 */
            }
        }
    });
    return bankAccount;
};
