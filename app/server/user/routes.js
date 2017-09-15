/**
 * Created by rotaylor on 1/15/2017.
 */
'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const endpoint = '/users';
const authController = require('../authentication/authentication.controller');
//router.use(authController.authenticate);
router.post(endpoint + '/register', controller.validateCreate, controller.createUser);
router.post(endpoint + '/login', controller.validateLogin, controller.login);
router.put(endpoint + '/:id', authController.authenticate, controller.validateChangePassword, controller.changePassword);
module.exports = router;

