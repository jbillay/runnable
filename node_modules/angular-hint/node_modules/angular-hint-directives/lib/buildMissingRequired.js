module.exports = function(info, id, type) {
  var s = info.missing.length === 1 ? ' ' : 's ';
  var waswere = info.missing.length === 1 ? 'was ' : 'were ';
  var missing = '';
  info.missing.forEach(function(str){
    missing += '"'+str+'",';
  });
  missing = '['+missing.substring(0,missing.length-1)+'] ';
  var message = 'Attribute'+s+missing+waswere+'found to be missing in '+type+ ' element'+id+'.';
  return message;
};
