var hintLog = require('angular-hint-log');

module.exports = function(directiveName) {
  var message = 'Directive "'+directiveName+'" should have proper namespace try adding a prefix'+
    ' and/or using camelcase.';
  var domElement = '<'+directiveName+'> </'+directiveName+'>';
  hintLog.logMessage('##Directives## ' + message);
};
