module.exports = function(app, context) {

    // Chat Route Middleware
    app.get('/chat', function(req, res) {
        if (req.session.user && req.cookies.user_sid) {
            context.siteTitle = "Group Chat";
            res.render('chat', context);
            context.initMessage = "";
            return;
        }
        else {
            res.redirect('/login');
        }
    });


};
