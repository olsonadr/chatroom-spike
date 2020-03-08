

// // // // // // // // // // // // // // //
// // //        DEPENDENCIES        // // //
// // // // // // // // // // // // // // //

// External Requirements
var express      = require('express');
var hb           = require('express-handlebars');
var path         = require('path');
var bodyParser   = require('body-parser');
var fs           = require('fs');
var pIP          = require('public-ip');
var session      = require('express-session');
var cookieParser = require('cookie-parser');

// Create Express app
var app	         = express();

// Futher Requirements
var http         = require('http').Server(app);
var io           = require('socket.io')(http);

// Babel Compatibility
var regeneratorRuntime = require('regenerator-runtime');



// // // // // // // // // // // // // // //
// // //     PROGRAM PARAMETERS     // // //
// // // // // // // // // // // // // // //

// Set constants
const publicDir = path.join(__dirname, '../public');
const port	    = process.env.PORT || 3000;

// Handlebars context for html rendering
var indexContext = {
    helpers: {
        section: function(name, options) {
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    },
    siteTitle:    "Unset",
    logoSource:   "/BLK_BOARD_logo.jpg",
    initData:     "",
    initMessage:  ""
};



// // // // // // // // // // // // // // //
// // //           MODELS           // // //
// // // // // // // // // // // // // // //

// User model for authentication
var User = require('../models/user.js');



// // // // // // // // // // // // // // //
// // //     UTILITY FUNCTIONS      // // //
// // // // // // // // // // // // // // //

// Whether a connection should be accepted to a chat room
const acceptChatConnection = require('../utils/accept_chat_connection');



// // // // // // // // // // // // // // //
// // //     SETUP EXPRESS APP      // // //
// // // // // // // // // // // // // // //

// Setup Express + Handlebars app engine
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());



// // // // // // // // // // // // // // //
// // //      MISC MIDDLEWARE       // // //
// // // // // // // // // // // // // // //

// Middleware to Check for User Session Cookie
const sessionChecker = require('../middleware/check_user_session.js');

// Static Public Directory Middleware
app.use(express.static(publicDir));

// Session + Socket.io Integration Middleware
require('../middleware/session_socket_integration.js')(app, io, session);

// Clear Previously Saved Cookies Middleware
require('../middleware/clear_cookies.js')(app);



// // // // // // // // // // // // // // //
// // //       EXPRESS ROUTES       // // //
// // // // // // // // // // // // // // //

// Index Route Middleware
require('../routes/index.js')(app, sessionChecker);

// Signup Route Middleware
require('../routes/signup.js')(app, sessionChecker, indexContext, User);

// Login Route Middleware
require('../routes/login.js')(app, sessionChecker, indexContext, User);

// Chat Route Middleware
require('../routes/chat.js')(app, indexContext);

// Logout Route Middleware
require('../routes/logout.js')(app);

// 404 Route Middleware
require('../routes/404.js')(app, indexContext);



// // // // // // // // // // // // // // //
// // //    SOCKET.IO MIDDLEWARE    // // //
// // // // // // // // // // // // // // //

// Socket.io Middleware for '/chat' Socket
require('../middleware/chat_socket_handling.js')(io, acceptChatConnection);



// // // // // // // // // // // // // // //
// // //       START LISTENING      // // //
// // // // // // // // // // // // // // //

// Get public IP address
(async () => { return await pIP.v4() + ":" + port; })()
    .then((hostIP) => {
        // Then listen on port
        http.listen(port, function() {
            console.log(` ~=> Server is a go at ${hostIP}`);
        });
    });
