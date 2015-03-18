module.exports = function(parts, concatLength) {
  var total = '';
  for(var i = 0; i <= concatLength; i++) {
    var period = (i===0) ? '' : '.';
    total+=period+parts[i].trim();
  }
  return total;
};
