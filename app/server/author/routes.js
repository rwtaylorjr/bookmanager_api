/**
 * Created by rotaylor on 1/15/2017.
 */
'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./authors.controller');
const authController = require('../authentication/authentication.controller');
const endpoint = '/authors';

//router.use(authController.authenticate);
router.get(endpoint + '/:id', authController.authenticate, controller.getAuthor);
router.get(endpoint, authController.authenticate, controller.findAuthors);
router.post(endpoint, authController.authenticate, controller.validateCreate, controller.createAuthor);
router.put(endpoint + '/:id', authController.authenticate, controller.validateUpdate, controller.updateAuthor);
router.delete(endpoint, authController.authenticate, controller.validateDelete, controller.deleteAuthors);
module.exports = router;



