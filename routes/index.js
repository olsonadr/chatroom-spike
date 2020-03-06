module.exports = function(app, sessionChecker) {

    // Index Route Middleware
    app.get('/', sessionChecker, function(req, res) {
        // Redirect to login page (after sessionChecker)
        res.redirect('/login');
    });

};
