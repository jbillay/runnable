var hintLog = require('angular-hint-log');

module.exports = function(directiveName) {
  var message = 'The use of "replace" in directive factories is deprecated,'+
    ' and it was found in "'+directiveName+'".';
  var domElement = '<'+directiveName+'> </'+directiveName+'>';
  hintLog.logMessage('##Directives## ' + message);
};
