/**
 * Created by jeremy on 31/01/15.
 */

'use strict';

module.exports = function(sequelize, DataTypes) {
    var validationJourney = sequelize.define('ValidationJourney', {
        comment_driver:     DataTypes.TEXT,
        comment_service:    DataTypes.TEXT,
        rate_driver:        DataTypes.INTEGER,
        rate_service:       DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function(models) {
                /*jshint -W030 */
                validationJourney.belongsTo(models.Join),
                validationJourney.belongsTo(models.User);
                /*jshint +W030 */
            }
        }
    });
    return validationJourney;
};
