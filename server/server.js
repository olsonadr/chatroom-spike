
// Express requires
var express      = require('express');
var hb           = require('express-handlebars');
var app	         = express();
var path         = require('path');
var http         = require('http').Server(app);
var bodyParser   = require('body-parser');
var fs           = require('fs');
var pIP          = require('public-ip');
var io           = require('socket.io')(http);
var session      = require('express-session');
var mongoStore   = require('connect-mongo')(session);
var ppIo         = require('passport.socketio');
var pp           = require('passport');
var cookieParser = require('cookie-parser')//('session_secret');

// Babel compatibility
var regeneratorRuntime = require('regenerator-runtime');

// Utility classes
var User = require('./unit_helpers/user');

// Set constants
const publicDir = path.join(__dirname, '../public');
const port	    = process.env.PORT || 3000;

// // Setup session store
// var mongoSS = new mongoStore({ url: 'mongodb+srv://team:team@se-project-q1cgp.mongodb.net/test?retryWrites=true&w=majority' });

// Setup express + handlebars app engine
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// // Configure Socket.io
// io.origins('*:*');

// Handlebars Context for html rendering
var indexContext = {
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    },
    siteTitle:  "Unset",
    logoSource: "/BLK_BOARD_logo.jpg",
    styles:      [{src: "/style.css"}, {src: "/chat_style.css"},
                  {src: "https://use.fontawesome.com/releases/v5.11.2/css/all.css"},
                  {src: "https://fonts.googleapis.com/css?family=Roboto|Roboto+Slab:100"}],
    scripts:     [{src: "/index.js"}, {src: "http://code.jquery.com/jquery-1.10.1.min.js"}],
    initData:    "",
    initMessage: "",
    socketURL:   ""//hostIP//'127.0.0.1:3000'//hostIP//"http://128.193.254.86:3000/"
};

// Create Session Middleware
var sessionMiddleware = session({
    key:          'user_sid',       // the name of the cookie where express/connect stores its session_id
    secret:       'session_secret',    // the session_secret to parse the cookie
    // store:        mongoSS,               // we NEED to use a sessionStore. no memorystore please
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

// Use Static Public Directory Middleware
app.use(express.static(publicDir));

// Check for Previously Saved Cookies Middleware
app.use((req, res, next) => {
    if (req.cookies && req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
    return;
});

// Middleware to Check for Logged-In Users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/chat');
    } else {
        next();
    }
};

// Index Route Middleware
app.get('/', sessionChecker, function(req, res) {
    // Redirect to login page (after sessionChecker)
    res.redirect('/login');
});

// Signup Route Middleware
app.route('/signup')
   .get(sessionChecker, (req, res) => {
      indexContext.siteTitle = 'Signup';
      res.render('signup', indexContext);
      indexContext.initMessage = "";
      return;
   })
   .post((req, res) => {
      User.create({
          username: req.body.username,
          password: req.body.password
      })
      .then(user => {
          req.session.user = user.dataValues;
          res.send({redirect: '/chat'});
          return;
      })
      .catch(error => {
          // console.log(error)
          indexContext.initMessage = 'Signup error! Username must be untaken!';
          res.send({redirect: '/signup'});
          return;
      });
   });

// Login Route Middleware
app.route('/login')
    .get(sessionChecker, (req, res) => {
        indexContext.siteTitle = 'Login';
        res.render('login', indexContext);
        indexContext.initMessage = "";
        return;
    })
    .post((req, res) => {
        var username = req.body.username;
        var password = req.body.password;

        User.findOne({ where: { username: username } })
            .then((user) => {
                console.log(`Authenticated? ${user.vPass(password)}`);
                if(!user) {
                    indexContext.initMessage = 'Incorrect username or password!';
                    res.send({redirect: '/login'});
                    return;
                }
                // else if(!user.validPassword(password)) {
                else if(!user.vPass(password)) {
                    indexContext.initMessage = 'Incorrect username or password!';
                    res.send({redirect: '/login'});
                    return;
                }
                else {
                    req.session.user = user.dataValues;
                    res.send({redirect: '/chat'});
                    return;
                }
            });
    });

// Chat Route Middleware
app.get('/chat', function(req, res) {
    if (req.session.user && req.cookies.user_sid) {
        indexContext.siteTitle = "Group Chat";
        res.render('chat', indexContext);
        indexContext.initMessage = "";
        return;
    }
    else {
        res.redirect('/login')
    }
});

// Logout Route Middleware
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    }
    else {
        res.redirect('/login');
    }
});

// 404 Route Middleware
app.get('*', function(req, res, next) {
    indexContext.siteTitle = "Page Not Found";
    return res.render('404', indexContext);
});

// Whether a connection should be accepted to a chat room
var acceptChatConnection = function(socket) {
    // User not logged in
    if (typeof(socket.request.session.user) == 'undefined')
        { return false; }

    // User already connected

    // Else (all good)
    return true;
};

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


// Get public IP address
(async () => { return await pIP.v4() + ":" + port; })()

.then((hostIP) => { // Then continue with the program

    // Listen on port
    http.listen(port, function() {
        console.log(` ~=> Server is a go at ${hostIP}`);
    });

});
