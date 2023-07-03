
const mongoose = require('mongoose');
const Habit = require('../models/habits');
const User = require('../models/users');

const Month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];


// create new habit
module.exports.createHabit = async function(req, res){

    // check if user is 
    try{

        let user = await User.findById(req.user.id);

        if(user){

            let today = new Date();
            let date = today.getDate();

            let habit = await Habit.create({
                content : req.body.habit,
                date_creation : date,
                days : ['None', 'None', 'None', 'None', 'None', 'None', 'None'],
                user : user.id,
                completed : 0,
                streak : 0,
            });
            req.flash('success', "Habit created successfully");
            user.habits.push(habit.id);
            user.save();
            return res.redirect('back');
        }
    }catch(err){
        console.log(err);
        return;
    }
    

    

}


// delete habit
module.exports.deleteHabit = async function(req, res){
    
    try{
        let id = req.params.id;

        // check if habit is exist
        let habit = await Habit.findById(id);
        
        if(habit){
            let user_id = habit.user;
            habit.remove();

            // now delete habit id from user habits array
            await User.findByIdAndUpdate(user_id, { $pull : { habits : id } });
            req.flash('success', "Habit deleted successfully");
            return res.redirect('/habits/dashboard');
        }
    }catch(err){
        req.flash('error', 'Habit not deleted');
        return res.redirect('/habits/dashboard');
    }
    
}


// dashboard
module.exports.dashboard = async function(req, res){
    try{
        if(req.isAuthenticated()){

            let user = await User.findById(req.user.id).populate('habits');
    
            let habits = user.habits;
            
            req.flash('success', "Welcome");
            return res.render('dashboard', {
                title : "HT | Dashboard",
                habits : habits,
                user : user,
            });
        }
    }catch(err){
        console.log(err);
        return res.render('login', {
            title : "HT | Login"
        });
    }

}

// action for updating status
module.exports.update = function(req, res){
    let id = req.params.id;
    let day = req.params.day;
    let status = req.params.status;

    Habit.findById(id, function(err, habit){
        if(err){
            console.log('Error while finding habit in update', err);
            return res.redirect('back');
        }
        habit.days[day] = status;
        habit.save();
        updateStreakAndCompleted(habit);
        req.flash('success', 'Habit updated');
        return res.redirect('/habits/dashboard-weekly');
    });
}



// weekly habit view
module.exports.weeklyView = async function(req, res){

    try{
        if(req.isAuthenticated()){
            let date = new Date();
            let days = [];
    
            for(let i = 0; i < 7; i++){
                let d = date.getDate() + ' ' + Month[date.getMonth()] + ',' + date.getFullYear();
                date.setDate(date.getDate() - 1);    // decrese back days by decreasing 1
                days.push(d);
            }
    
            // reverse days array
            days.reverse();
    
            // find user then find all habits regarding that user
            let user = await User.findById(req.user.id).populate('habits');
            let habits = user.habits;
    
            // udate in habits of user
            updateData(habits);
    
            req.flash('seccess', "Status updated successfully");
            return res.render('weekly', {
                title : "HT | weeklyBoard",
                habits : habits,
                days,
            });
        }
    }catch(err){
        console.log(err);
        return;
    }

}


// update habits data
let updateData = function(habits){
    let todayDate = new Date().getDate();

    // find the date of creation and todays date in diff or not
    // if yes then find the diff & upadte in DB
    for(let habit of habits){
        let id = habit.id;
        let diff = todayDate - habit.date_creation;

        if(diff > 0 && diff < 8){
            for(let i = diff, j = 0; i < habit.days.length; i ++, j ++){
                habit.days[j] = habit.days[i];
            }

            let remPos = habit.days.length - diff;
            for(let i = remPos; i < habit.days.length; i++){
                habit.days[i] = 'None';
            }

            habit.date_creation = todayDate;
            updateStreakAndCompleted(habit);
            habit.save();
        }else if(diff > 7){
            for(let i = 0; i < 7; i++){
                habit.days[i] = 'None';
                habit.date_creation = todayDate;
                updateStreakAndCompleted(habit);
                habit.save();
            }
        }
    }
}

// for streak and completed
let updateStreakAndCompleted = async function(habit){
    try{
        let curr_completed = 0;
        let max_streak = 0;
        curr_streak = 0;
        for (let i = 0; i < habit.days.length; i++) {
            if(habit.days[i] == 'Done'){
                curr_completed ++;
                curr_streak ++;
            }else{
                if(curr_streak > max_streak){
                    max_streak = curr_streak;
                    curr_streak = 0;
                }else{
                    streak = 0;
                }
            }
        }

        if(curr_streak > max_streak){
            max_streak = curr_streak;
        }
        await Habit.findByIdAndUpdate(habit.id, {
            streak : max_streak,
            completed : curr_completed,
        });
    }catch(err){
        console.log(err);
        return;
    }
}
