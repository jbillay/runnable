var queuedMessages = {};
function logMessage(message) {
  var nameAndValue = message.split(/##/);
  if(nameAndValue[0] !== '') {
    if(queuedMessages['No Name']) {
      queuedMessages['No Name'][message] = message;
    }  else {
      queuedMessages['No Name'] = {};
      queuedMessages['No Name'][message] = message;
    }
  } else if(queuedMessages[nameAndValue[1]]) {
    queuedMessages[nameAndValue[1]][nameAndValue[2]] = nameAndValue[2];
  } else {
    queuedMessages[nameAndValue[1]] = {};
    queuedMessages[nameAndValue[1]][nameAndValue[2]] = nameAndValue[2];
  }
  module.exports.onMessage(message);
};

function flush() {
  var flushMessages = queuedMessages;
  queuedMessages = {};
  return flushMessages;
};

module.exports.onMessage = function(message) {};
module.exports.logMessage = logMessage;
module.exports.flush = flush;