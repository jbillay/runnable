var areSimilarEnough = require('./areSimilarEnough');
var levenshteinDistance = require('./levenshtein');

module.exports = function getSuggestion(original, props) {
  var min_levDist = Infinity, closestMatch = '';
  for(var i in props) {
    var prop = props[i];
    if(areSimilarEnough(original, prop)) {
      var currentlevDist = levenshteinDistance(original, prop);
      var closestMatch = (currentlevDist < min_levDist)? prop : closestMatch;
      var min_levDist = (currentlevDist < min_levDist)? currentlevDist : min_levDist;
    }
  }
  return closestMatch;
};
