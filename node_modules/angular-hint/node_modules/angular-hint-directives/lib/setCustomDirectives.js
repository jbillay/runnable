var ddLibData = require('../lib/ddLib-data');

module.exports = function(customDirectives) {
  customDirectives.forEach(function(directive) {
    var directiveName = directive.directiveName.replace(/([A-Z])/g, '-$1').toLowerCase();
    ddLibData.directiveTypes['angular-custom-directives']
      .directives[directiveName] = directive;
  });
};
