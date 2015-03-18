var isMutExclusiveDir = require('./isMutExclusiveDir');

module.exports = function(attr, attributes) {
  var pair = isMutExclusiveDir(attr);

  return attributes.some(function(otherAttr) {
    return otherAttr.nodeName === pair;
  });
};
