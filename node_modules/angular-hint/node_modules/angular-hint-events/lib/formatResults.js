var hintLog = require('angular-hint-log');
var addSuggestions = require('./addSuggestions');

module.exports = function formatResults(messages) {
  messages = addSuggestions(messages);
  if(messages.length) {
    messages.forEach(function(obj) {
      var id = (obj.element[0].id) ? ' with id: #'+obj.element[0].id : '';
      var type = obj.element[0].nodeName;
      var suggestion = obj.match ? ' (Try "'+obj.match+'")': '';
      var message = 'Variable "'+obj.boundFunc+'" called on '+type+' element'+id+' does not '+
      'exist in that scope.'+suggestion+' Event directive found on ' + obj.element[0] + ' in ' +
      obj.scope + ' scope.';
      hintLog.logMessage('##Events## ' + message);
    });
  }
};
