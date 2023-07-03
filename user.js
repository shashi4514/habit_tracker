
const express = require('express');
const passport = require('passport');
const router = express.Router();

const usersController = require('../controllers/users_controller');

router.get('/login', usersController.login);
router.get('/register', usersController.register);

router.get('/logout', usersController.destroySession);

router.post('/create-user', usersController.createUser);

router.post('/create-session', passport.authenticate(
    'local',
    {failureRedirect : '/users/login'},
), usersController.createSession);

module.exports = router;
