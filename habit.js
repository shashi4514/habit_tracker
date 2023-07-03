
const express = require('express');
const router = express.Router();
const passport = require('passport');

const habitsController = require('../controllers/habits_controller');

router.post('/create', habitsController.createHabit);

router.get('/delete/:id', habitsController.deleteHabit);
router.get('/dashboard', passport.checkAuthentication, habitsController.dashboard);
router.get('/dashboard-weekly', passport.checkAuthentication, habitsController.weeklyView);
router.get('/update/:id/:day/:status', habitsController.update);


module.exports = router;
