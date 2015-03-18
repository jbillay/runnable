var getValidProps = require('./getValidProps');
var getSuggestion = require('./getSuggestion');

module.exports = function addSuggestions(messages) {
  messages.forEach(function(messageObj) {
    var props = getValidProps(messageObj.scope);
    var suggestion = getSuggestion(messageObj.boundFunc, props);
    messageObj['match'] = suggestion;
  });
  return messages;
};
