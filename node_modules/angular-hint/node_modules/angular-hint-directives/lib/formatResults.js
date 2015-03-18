var hintLog = require('angular-hint-log');

var build = {
  wronguse: require('./buildWrongUse'),
  nonexsisting: require('./buildNonExsisting'),
  missingrequired: require('./buildMissingRequired'),
  ngevent: require('./buildNgEvent'),
  mutuallyexclusive: require('./buildMutuallyExclusive')
};

/**
 *@param failedElements: [] of {}s of all failed elements with their failed attributes and closest
 *matches or restrict properties
 *
 *@return [] of failed messages.
 **/
module.exports = function(failedElements) {
  failedElements.forEach(function(obj) {
    obj.data.forEach(function(info) {
      var id = (obj.domElement.id) ? ' with id: #' + obj.domElement.id : '';
      var type = obj.domElement.nodeName;
      var message = build[info.typeError](info, id, type);
      hintLog.logMessage('##Directives## ' + message);
    });
  });
};
