module.exports = function getFunctionNames(str) {
  var results = str.replace(/\s+/g,'').split(/[\+\-\/\|\<\>\^=&!%~]/g).map(function(x){
    if(isNaN(+x)) {
      if(x.match(/\w+\(.*\)$/)){
        return x.substring(0,x.indexOf('('));
      }
      return x;
    }
  }).filter(function(x){return x;});
  return results;
};
