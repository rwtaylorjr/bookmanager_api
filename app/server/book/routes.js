/**
 * Created by rotaylor on 1/15/2017.
 */
'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./books.controller');
const authController = require('../authentication/authentication.controller');
const endpoint = '/books';
//router.use(authController.authenticate);
router.get(endpoint + '/:id', authController.authenticate, controller.getBook);
router.get(endpoint, authController.authenticate, controller.findBooks);
router.post(endpoint, authController.authenticate, controller.validateCreate, controller.createBook);
router.put(endpoint + '/:id', authController.authenticate, controller.validateUpdate, controller.updateBook);
router.delete(endpoint, authController.authenticate, controller.validateDelete, controller.deleteBooks);
module.exports = router;

