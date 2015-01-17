/**
 * Created by jeremy on 14/01/15.
 */

module.exports = function (socket) {
    console.log('Client connection');
    socket.on('discussion:newMessage', function (msg) {
        console.log('Discussion message received');
        socket.emit('discussion:newMessage', msg);
    });
};