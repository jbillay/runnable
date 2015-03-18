module.exports = function getEventDirectives() {
  var list = 'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' ');
  var eventDirHash = {};
  list.map(function(x){
    var name = 'ng'+x.charAt(0).toUpperCase()+x.substring(1);
    eventDirHash[name]=name;
  });
  return eventDirHash;
};
