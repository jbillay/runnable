var areSimilarEnough = require('./areSimilarEnough');
var levenshtein = require('./levenshtein');

module.exports = function (part, scope) {
  var min_levDist = Infinity, closestMatch = '';
  for(var i in scope) {
    if(areSimilarEnough(part, i)) {
      var currentlevDist = levenshtein(part, i);
      closestMatch = (currentlevDist < min_levDist)? i : closestMatch;
      min_levDist = (currentlevDist < min_levDist)? currentlevDist : min_levDist;
    }
  }
  return closestMatch;
};
