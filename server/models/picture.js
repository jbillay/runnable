/**
 * Created by jeremy on 02/01/15.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Picture = sequelize.define('Picture', {
        link:       DataTypes.TEXT,
        default:    DataTypes.BOOLEAN
    }, {
        classMethods: {
            associate: function(models) {
                /*jshint -W030 */
                Picture.belongsTo(models.Run, {constraints: false});
                /*jshint +W030 */
            }
        }
    });
    return Picture;
};
