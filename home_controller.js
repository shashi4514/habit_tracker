
// home page redering controller
module.exports.home = function(req, res){
    if(req.isAuthenticated()){
        return res.render('home', {
            title : "HT | Home"
        });
    }
    req.flash('success', 'Welcome');
    return res.render('home', {
        title : "HT | Home"
    });
}
