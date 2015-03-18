var hintLog = angular.hint = require('angular-hint-log');

var partsEvaluate = require('./partsEvaluate');

module.exports = function(allParts, originalInterpolation, scope, $timeout) {
  var message = partsEvaluate(allParts, originalInterpolation, scope);
  if(message) {
    hintLog.logMessage('##Interpolation## ' + message);
  }
};
