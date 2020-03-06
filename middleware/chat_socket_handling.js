module.exports = function(io, acceptChatConnection) {

    // Socket.io Middleware for '/chat' Socket
    io.of('/chat')
      .on('connection', function(socket) {

        // Check if connection is unwanted (including username is set)
        if (!acceptChatConnection(socket)) {
            console.log(`Closing connection to socket ${socket.id}`);
            socket.disconnect(true);
            return;
        }

        var username = socket.request.session.user.username;
        // console.log(socket.request.session.user.username)

        socket.on('chat_join', function() {
            io.of('/chat').emit('is_online', '🔵 <i>' + username + ' joined the chat.</i>');
        });

        socket.on('disconnect', function() {
            io.of('/chat').emit('is_online', '🔴 <i>' + username + ' left the chat.</i>');
        });

        socket.on('chat_message', function(message) {
            io.of('/chat').emit('chat_message', '<strong>' + username + '</strong>: ' + message);
        });

    });

}
