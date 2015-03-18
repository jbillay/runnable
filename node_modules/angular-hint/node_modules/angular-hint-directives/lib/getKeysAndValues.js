module.exports = function(str) {
  var customDirectives = [], pairs = [];
  var matchScope = str.replace(/\n/g,'').match(/scope\s*:\s*{\s*[^}]*['"]\s*}/);
  if (matchScope) {
    matchScope[0].match(/\w+\s*:\s*['"][a-zA-Z=@&]+['"]/g).map(function(str){
      var temp = str.match(/(\w+)\s*:\s*['"](.+)['"]/);
      pairs.push({key:temp[1],value:temp[2]});
    });
    pairs.forEach(function(pair){
      var name = (['=', '@', '&'].indexOf(pair.value) !== -1)? pair.key : pair.value.substring(1);
      customDirectives.push({directiveName: name , restrict:'A'});
    });
  }
  return customDirectives;
};
