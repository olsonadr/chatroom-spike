export default function(app, io, session) {

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
    var ioSessionFunc = function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    };
    io.use(ioSessionFunc);
    ["/chat"].forEach((element) => {
        io.of(element).use(ioSessionFunc);
    });

    // Use Session Middleware
    app.use(sessionMiddleware);

    // Return sessionMiddleware
    return sessionMiddleware;

};
