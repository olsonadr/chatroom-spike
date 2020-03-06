module.exports = function(app, context) {

    // 404 Route Middleware
    app.get('*', function(req, res, next) {
        context.siteTitle = "Page Not Found";
        return res.render('404', context);
    });

};
