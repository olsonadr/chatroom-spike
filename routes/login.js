module.exports = function(app, sessionChecker, context, User) {

    // Login Route Middleware
    app.route('/login')
        .get(sessionChecker, (req, res) => {
            context.siteTitle = 'Login';
            res.render('login', context);
            context.initMessage = "";
            return;
        })
        .post((req, res) => {
            req.session.user = { username: req.body.username };
            res.send({redirect: '/chat'});
        });

};
