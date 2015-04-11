/**
 * Created by jeremy on 09/04/15.
 */
 
'use strict';

module.exports = function(sequelize, DataTypes) {
    var Pages = sequelize.define('Page', {
        title: DataTypes.STRING,
        tag: DataTypes.STRING,
        content: DataTypes.TEXT,
		is_active:	{ type: DataTypes.BOOLEAN, defaultValue: true }
    });
    return Pages;
};
