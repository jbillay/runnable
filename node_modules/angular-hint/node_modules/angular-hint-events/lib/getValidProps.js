module.exports = function getValidProps(obj) {
  var props = [];
  for(var prop in obj) {
    if (prop.charAt(0) != '$' && typeof obj[prop] == 'function') {
      props.push(prop);
    }
  }
  return props;
};
