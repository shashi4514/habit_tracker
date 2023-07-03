
const User = require('../models/users');
const Habit = require('../models/habits');


// login page rendring condition
module.exports.login = function(req, res){
    if(req.isAuthenticated()){
        req.flash('success', "Logout first");
        return res.render('dashboard', {
            title : "HT | Dashboard"
        });
    }else{
        return res.render('login', {
            title : 'HT | Login'
        });
    }
}


// register page rendring controller
module.exports.register = function(req, res){
    if(req.isAuthenticated()){
        req.flash('success', "Logout first");
        return res.render('dashboard', {
            title : "HT | Dashboard"
        });
    }else{
        return res.render('register', {
            title : 'HT | register'
        });
    }
}



// destroying session condition
module.exports.destroySession = function(req, res){
    req.logout();

    req.flash('success', 'Logged out Successfully');
    return res.redirect('/');
}


// create user 
module.exports.createUser = function(req, res){

    if(req.password != req.password2){
        console.log("Password don't match");
        return;
    }

    User.create(req.body, function(err, user){
        if(err){
            console.log("Error while creating user", err);
            return;
        }
        console.log("User created !");
        res.redirect('/users/login');
    });

}


// creating session
module.exports.createSession = function(req, res){
    req.flash('success', 'Log In Successfully')
    return res.redirect('/habits/dashboard');
}
