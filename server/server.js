// // // // // // // // // // // // // // //
// // //        DEPENDENCIES        // // //
// // // // // // // // // // // // // // //

// External Requirements
import express, { static as expressStatic } from "express";
import hb from "express-handlebars";
import { join } from "path";
import bodyParser from "body-parser";
import fs from "fs";
import session from "express-session";
import cookieParser from "cookie-parser";

// Create Express app
var app = express();

// Futher Requirements
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

var http = new HttpServer(app);
var io = new SocketIOServer(http);

// Babel Compatibility
import regeneratorRuntime from "regenerator-runtime";

// // // // // // // // // // // // // // //
// // //     PROGRAM PARAMETERS     // // //
// // // // // // // // // // // // // // //

// Set constants
const publicDir = join(new URL(".", import.meta.url).pathname, "../public");
const port = process.env.PORT || 3000;

// Handlebars context for html rendering
var indexContext = {
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
  siteTitle: "Unset",
  logoSource: "/BLK_BOARD_logo.jpg",
  initData: "",
  initMessage: "",
};

// // // // // // // // // // // // // // //
// // //           MODELS           // // //
// // // // // // // // // // // // // // //

// User model for authentication
import User from "../models/user.js";

// // // // // // // // // // // // // // //
// // //     UTILITY FUNCTIONS      // // //
// // // // // // // // // // // // // // //

// Whether a connection should be accepted to a chat room
import acceptChatConnection from "../utils/accept_chat_connection.js";

// // // // // // // // // // // // // // //
// // //     SETUP EXPRESS APP      // // //
// // // // // // // // // // // // // // //

// Setup Express + Handlebars app engine
app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");
app.enable("trust proxy");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// // // // // // // // // // // // // // //
// // //      MISC MIDDLEWARE       // // //
// // // // // // // // // // // // // // //

// Middleware to Check for User Session Cookie
import sessionChecker from "../middleware/check_user_session.js";
import sessionSocketIntegration from "../middleware/session_socket_integration.js";
import clearCookies from "../middleware/clear_cookies.js";
import indexRoute from "../routes/index.js";
import signupRoute from "../routes/signup.js";
import loginRoute from "../routes/login.js";
import chatRoute from "../routes/chat.js";
import logoutRoute from "../routes/logout.js";
import notFoundRoute from "../routes/404.js";
import chatSocketHandling from "../middleware/chat_socket_handling.js";

// Static Public Directory Middleware
app.use(expressStatic(publicDir));

// Session + Socket.io Integration Middleware
sessionSocketIntegration(app, io, session);
clearCookies(app);

// // // // // // // // // // // // // // //
// // //       EXPRESS ROUTES       // // //
// // // // // // // // // // // // // // //
// Index Route Middleware
indexRoute(app, sessionChecker);

// Signup Route Middleware
signupRoute(app, sessionChecker, indexContext, User);

// Login Route Middleware
loginRoute(app, sessionChecker, indexContext, User);

// Chat Route Middleware
chatRoute(app, indexContext);

// Logout Route Middleware
logoutRoute(app);

// 404 Route Middleware
notFoundRoute(app, indexContext);

// Socket.io Middleware for '/chat' Socket
chatSocketHandling(io, acceptChatConnection);

// // // // // // // // // // // // // // //
// // //       START LISTENING      // // //
// // // // // // // // // // // // // // //

// Get public IP address
(async () => {
  return "0.0.0.0:" + port;
})().then((hostIP) => {
  // Then listen on port
  http.listen(port, function () {
    console.log(` ~=> Server is a go at ${hostIP}`);
  });
});
