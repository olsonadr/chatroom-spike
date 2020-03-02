
// Express requires
var express = require('express');
var hb      = require('express-handlebars');
var app	    = express();

// General requires
var path        = require('path');
var http        = require('http').Server(app);
var bodyParser  = require('body-parser');
var fs          = require('fs');
var pIP         = require('public-ip');
var io          = require('socket.io')(http);

// Babel Compatibility
var regeneratorRuntime = require("regenerator-runtime");

// Set variables
const publicDir = path.join(__dirname, '../public');
const port	    = process.env.PORT || 3000;

// Setup express app engine
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));

// Get public IP address
(async () => { return await pIP.v4() + ":" + port; })()

.then(hostIP => { // Then continue with the program

    // Express Handlebars Context for html rendering
    var indexContext = {
        siteTitle:  "Group Chat",
        logoSource: "/BLK_BOARD_logo.jpg",
        styles:      [{src: "/style.css"}, {src: "/chat_style.css"},
                      {src: "https://use.fontawesome.com/releases/v5.11.2/css/all.css"},
                      {src: "https://fonts.googleapis.com/css?family=Roboto|Roboto+Slab:100"}],
        scripts:     [{src: "/index.js"}, {src: "/canvas.js"}, {src: "/neural.js"},
                      {src: "http://code.jquery.com/jquery-1.10.1.min.js"}],
        initData:    "",
        initMessage: "",
        socketURL:   hostIP//"http://128.193.254.86:3000/"
    };

    // Express Handlebars Middleware functions
    app.use(express.static(publicDir));
    app.get('/', function(req, res, next) {
        indexContext.initData = "";
        indexContext.initMessage = "";
        res.render('index', indexContext);
    });
    app.get('*', function(req, res, next) {
        indexContext.initData = "";
        indexContext.initMessage = "";
        res.render('404', indexContext);
    });

    // Socket.io Realtime Communication Functions
    io.sockets.on('connection', function(socket) {
        socket.on('username', function(username) {
            socket.username = username;
            io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
        });
        socket.on('disconnect', function(username) {
            io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
        })
        socket.on('chat_message', function(message) {
            io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
        });
    });

    // Listen on port
    http.listen(port, function() {
        console.log(` ~=> Server is a go at ${hostIP}`);
    });

});
