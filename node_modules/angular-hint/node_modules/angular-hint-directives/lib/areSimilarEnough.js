/**
 *@param s: first string to compare
 *@param t: second string to compare
 *
 *@description:
 *Checks to see if two strings are similiar enough to even bother checking the Levenshtein Distance.
 */
module.exports = function(s,t) {
  var strMap = {}, similarities = 0, STRICTNESS = 0.66;
  if(Math.abs(s.length-t.length) > 3) {
    return false;
  }
  s.split('').forEach(function(x){strMap[x] = x;});
  for (var i = t.length - 1; i >= 0; i--) {
    similarities = strMap[t.charAt(i)] ? similarities + 1 : similarities;
  }
  return similarities >= t.length * STRICTNESS;
};
