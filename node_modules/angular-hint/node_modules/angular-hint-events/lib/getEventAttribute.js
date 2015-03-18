var ngEventDirectives = require('./getEventDirectives')();

module.exports = function getEventAttribute(attrs) {
  for(var attr in attrs) {
    if(ngEventDirectives[attr]) {
      return attr;
    }
  }
};
