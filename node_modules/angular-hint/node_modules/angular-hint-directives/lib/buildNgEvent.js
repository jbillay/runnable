module.exports = function(info, id, type) {
  var ngDir = 'ng-'+info.error.substring(2);
  var message = 'Use Angular version of "'+info.error+'" in '+type+' element'+id+'. Try: "'+ngDir+'"';
  return message;
};
