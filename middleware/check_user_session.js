module.exports = function(req, res, next) {

    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/chat');
    } else {
        next();
    }

};
