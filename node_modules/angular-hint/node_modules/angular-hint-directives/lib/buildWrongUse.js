var ddLibData = require('./ddLib-data');

module.exports = function(info, id, type) {
  var message = ddLibData.directiveTypes[info.directiveType].message+type+' element'+id+'. ';
  var error = (info.error.charAt(0) === '*') ? info.error.substring(1): info.error;
  var aecmType = (info.wrongUse.indexOf('attribute') > -1)? 'Element' : 'Attribute';
  message += aecmType+' name "'+error+'" is reserved for '+info.wrongUse+' names only.';
  return message;
};
