module.exports = function (dirName) {
  var exclusiveDirHash = {
    'ng-show' : 'ng-hide',
    'ng-hide' : 'ng-show',
    'ng-switch-when' : 'ng-switch-default',
    'ng-switch-default' : 'ng-switch-when',
  };
  return exclusiveDirHash[dirName];
};
