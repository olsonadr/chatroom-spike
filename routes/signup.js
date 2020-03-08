module.exports = function(app, sessionChecker, context, User) {

    // Signup Route Middleware
    app.route('/signup')
        .get(sessionChecker, (req, res) => {
            context.siteTitle = 'Signup';
            res.render('signup', context);
            context.initMessage = "";
            return;
        })
        .post((req, res) => {
            req.session.user = { username: req.body.username };
            res.send({redirect: '/chat'});
        });

};
