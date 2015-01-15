/**
 * Created by jeremy on 14/01/15.
 */

module.exports = function (server) {
    console.log('Init Socket.io');
    var io = require("socket.io")(server);
    io.on('connection', function (socket) {
        console.log('Client connection');
        socket.on('discussion:newMessage', function (from, data) {
            console.log('Discussion message received');
            socket.emit('discussion:newMessage', data);
        });
    });
};