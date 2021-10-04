const user = require("../models/user"),
      AccessMiddleware = {};
AccessMiddleware.isAdmin = function(req, res, next){
    if(req.user.role == 'administrateur')
        next();
    else
        res.redirect("/dashboard");
}
AccessMiddleware.isSuper = function(req, res, next){
    if(req.user.role == 'administrateur' || req.user.role == 'directrice')
        next();
    else
        res.redirect("/dashboard");
}
AccessMiddleware.isDirector = function(req, res, next){
    if(req.user.role == 'directrice')
        next();
    else
        res.redirect("/dashboard");
}
AccessMiddleware.isEducatrice = function(req, res, next){
    if(req.user.role == 'educatrice')
        next();
    else
        res.redirect("/dashboard");
}
AccessMiddleware.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated())
        return next();
    res.redirect("/");
};
module.exports = AccessMiddleware;