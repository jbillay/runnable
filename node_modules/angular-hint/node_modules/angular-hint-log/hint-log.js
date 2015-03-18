/**
* HintLog creates a queue of messages logged by ngHint modules. This object
* has a key for each ngHint module that corresponds to the messages
* from that module.
*/
var queuedMessages = {};

/**
* Add a message to the HintLog message queue. Messages are organized into categories
* according to their module name which is included in the message with ##ModuleName##.
* If a ##ModuleName## is not included, the message is added to a `General` category
* in the queue.
**/
function logMessage(message) {
  //HintLog messages are delimited by `##ModuleName## Module Message`
  //Split the message into the name and message value
  var nameThenValue = message.split(/##/);
  //If no ##ModuleName## was found, categorize the message under `General`
  if(nameThenValue[0] !== '') {
    //If the category does not exist, initialize a new object
    queuedMessages.General = queuedMessages.General || {};
    queuedMessages.General[message] = message;
  } else {
    //Strip leading spaces in message caused by splitting out ##ModuleName##
    nameThenValue[2] = nameThenValue[2].charAt(0) === ' ' ? nameThenValue[2].substring(1)
      : nameThenValue[2];
    //If the category does not exist, initialize a new object
    queuedMessages[nameThenValue[1]] = queuedMessages[nameThenValue[1]] || {};
    queuedMessages[nameThenValue[1]][nameThenValue[2]] = nameThenValue[2];
  }
  module.exports.onMessage(message);
}

/**
* Return and empty the current queue of messages.
**/
function flush() {
  var flushMessages = queuedMessages;
  queuedMessages = {};
  return flushMessages;
}

module.exports.onMessage = function(message) {};
module.exports.logMessage = logMessage;
module.exports.flush = flush;