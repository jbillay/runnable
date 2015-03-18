/**
 *@param s: first string to compare for Levenshtein Distance.
 *@param t: second string to compare for Levenshtein Distance.
 *
 *@description
 *Calculates the minimum number of changes (insertion, deletion, transposition) to get from s to t.
 *
 *credit: http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
 *http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
 **/
module.exports = function(s, t) {
  if(typeof s !== 'string' || typeof t !== 'string') {
    throw new Error('Function must be passed two strings, given: '+typeof s+' and '+typeof t+'.');
  }
  var d = [];
  var n = s.length;
  var m = t.length;

  if (n === 0) {return m;}
  if (m === 0) {return n;}

  for (var ii = n; ii >= 0; ii--) { d[ii] = []; }
  for (var ii = n; ii >= 0; ii--) { d[ii][0] = ii; }
  for (var jj = m; jj >= 0; jj--) { d[0][jj] = jj; }
  for (var i = 1; i <= n; i++) {
    var s_i = s.charAt(i - 1);

    for (var j = 1; j <= m; j++) {
      if (i == j && d[i][j] > 4) return n;
      var t_j = t.charAt(j - 1);
      var cost = (s_i == t_j) ? 0 : 1;
      var mi = d[i - 1][j] + 1;
      var b = d[i][j - 1] + 1;
      var c = d[i - 1][j - 1] + cost;
      if (b < mi) mi = b;
      if (c < mi) mi = c;
      d[i][j] = mi;
      if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[n][m];
};
