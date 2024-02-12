const routes = require('express').Router();
const authController = require('../controllers/auth.controller');

routes.post('/signup', authController.signup);
routes.post('/login', authController.login);
routes.get('/logout', authController.logout);
routes.get('/refresh_token', authController.refreshToken);


module.exports = routes;