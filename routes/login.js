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
            var username = req.body.username;
            var password = req.body.password;

            User.findOne({ where: { username: username } })
                .then((user) => {
                    if(!user) {
                        context.initMessage = 'Incorrect username or password!';
                        res.send({redirect: '/login'});
                        return;
                    }
                    // else if(!user.validPassword(password)) {
                    else if(!user.vPass(password)) {
                        context.initMessage = 'Incorrect username or password!';
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

};
