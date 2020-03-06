// Whether a connection should be accepted to a chat room
module.exports = function(socket) {
    // User not logged in
    if (typeof(socket.request.session.user) == 'undefined')
        { return false; }

    // User already connected

    // Else (all good)
    return true;
};
