module.exports = function(app, io, session) {

    // Create Session Middleware
    var sessionMiddleware = session({
        key:          'user_sid',       // the name of the cookie where express/connect stores its session_id
        secret:       'session_secret',    // the session_secret to parse the cookie
        resave:       false,
        cookie:       { secure: false,
                       path: '/',
                       httpOnly: true,
                       expires: 600000 },
        saveUninitialized: true
    });

    // Socket.io Chat Socket + Session Middleware Adapter
    io.use(function(socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    // Use Session Middleware
    app.use(sessionMiddleware);

    // Return sessionMiddleware
    return sessionMiddleware;

};
