module.exports = function(app) {

    // Check for Previously Saved Cookies Middleware
    app.use((req, res, next) => {
        if (req.cookies && req.cookies.user_sid && !req.session.user) {
            res.clearCookie('user_sid');
        }
        next();
        return;
    });

};
