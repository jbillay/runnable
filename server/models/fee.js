/**
 * Created by jeremy on 11/04/2016.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Fee = sequelize.define('Fee', {
        code:       DataTypes.STRING,
        percentage: DataTypes.FLOAT,
        value:      DataTypes.FLOAT,
        discount:   DataTypes.FLOAT,
        default:    DataTypes.BOOLEAN,
        remaining:  DataTypes.INTEGER,
        start_date: DataTypes.DATE,
        end_date:   DataTypes.DATE
    }, {
        classMethods: {
            associate: function(models) {
                /*jshint -W030 */
                Fee.belongsTo(models.Run, {constraints: false});
                Fee.belongsTo(models.User, {constraints: false});
                /*jshint +W030 */
            }
        }
    });
    return Fee;
};
