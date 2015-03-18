var hasNameSpace = require('./hasNameSpace');
var buildNameSpace = require('./buildNameSpace');
var hasReplaceOption = require('./hasReplaceOption');
var buildReplaceOption = require('./buildReplaceOption');

module.exports = function(dirName, dirFacStr) {
  if (!hasNameSpace(dirName)) {
    buildNameSpace(dirName);
  }
  if (hasReplaceOption(dirFacStr)) {
    buildReplaceOption(dirName);
  }
};
