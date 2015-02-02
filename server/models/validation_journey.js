/**
 * Created by jeremy on 31/01/15.
 */

module.exports = function(sequelize, DataTypes) {
    "use strict";
    var validationJourney = sequelize.define("ValidationJourney", {
        comment_driver:     DataTypes.TEXT,
        comment_service:    DataTypes.TEXT,
        rate_driver:        DataTypes.INTEGER,
        rate_service:       DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function(models) {
                validationJourney.belongsTo(models.Join),
                validationJourney.belongsTo(models.User)
            }
        }
    });
    return validationJourney;
};
