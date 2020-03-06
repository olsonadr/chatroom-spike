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
                context.initMessage = 'Signup error! Username must be untaken!';
                res.send({redirect: '/signup'});
                return;
            });
        });

};
