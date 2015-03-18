var ddLibData = require('./ddLib-data');

module.exports = function(dirName, attributes) {
  attributes = attributes.map(function(x){return x.nodeName;});
  var directive = ddLibData.directiveTypes['angular-custom-directives'].directives[dirName];
  var missing = [];
  if (directive && directive.require) {
    for (var i = 0; i < directive.require.length; i++) {
      if (attributes.indexOf(directive.require[i].directiveName) < 0) {
        missing.push(directive.require[i].directiveName);
      }
    }
  }
  return missing;
};
