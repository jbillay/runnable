/**
 * Created by jeremy on 27/03/15.
 */
 
'use strict';

module.exports = function(sequelize, DataTypes) {
    var Options = sequelize.define('Options', {
        name: DataTypes.STRING,
        value: DataTypes.TEXT
    });
    return Options;
};
