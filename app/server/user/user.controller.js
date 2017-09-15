/**
 * Created by rotaylor on 8/11/2017.
 */
'use strict';
const HttpStatus = require('http-status-codes');

const userService = require('./user.service');
const UserError = require('./user-error');
const AppErr = require('../errors/app-error');
const InvalidRequestError = require('../errors/invalid-request-error');
const utils = require('../utils');
const authService = require('../authentication/authentication.service');


module.exports = {
    login:login,
    createUser:createUser,
    changePassword:changePassword,
    toUser:toUser,
    validateCreate:validateCreate,
    validateChangePassword:validateChangePassword,
    validateLogin:validateLogin
};

/**
 * Login to the application. If successful, return a JWT auth token
 * to be used in later requests.
 *
 * @param req
 * @param res
 * @param next
 */
function login(req, res, next) {

    userService.login(req.user).then((user) =>{
        const result = authService.createAuthToken(user);
        const payload = {token:result};
        res.status(HttpStatus.MOVED_TEMPORARILY).json(payload);
    }).catch((err) => {
        if (err.code === UserError.PASSWORD_MISMATCH) {
            next(new AppErr('Passwords did not match.', HttpStatus.FORBIDDEN, err.code));
        } else if (err.code === UserError.USER_NOT_FOUND) {
            next(new AppErr('No user found under specified user name.', HttpStatus.FORBIDDEN, err.code));
        } else {
            next(err);
        }
    });
}

/**
 * Create a new user in the system.
 *
 * @param req
 * @param res
 * @param next
 */
function createUser(req, res, next) {
    userService.createUser(req.user).then((user) =>{
        user.password = null;
        res.status(HttpStatus.CREATED).json();
    }).catch(next);
}

/**
 * Update an existing user
 *
 * @param req
 * @param res
 * @param next
 */
function changePassword(req, res, next) {
    const user = req.user; // logged in user
    const payload = req.body;
    const userId = payload.userId;
    const oldPassword = payload.oldPassword;
    const newPassword = payload.newPassword;
    userService.changePassword(userId, oldPassword, newPassword).then((result) => {
        //console.log('change password', result);
        const r = {success: result};
        res.status(HttpStatus.OK).json(r);
    }).catch(next);
}


function validateCreate(req, res, next) {
    const payload = req.body;
    if (!payload.userName || payload.userName === '') {
        next(InvalidRequestError.newParamValidationError('userName or password'))
    } else if (!payload.password || payload.password === '') {
        next(InvalidRequestError.newParamValidationError('userName or password'))
    } else {
        userService.findUserByUserName(payload.userName).then((user) =>{
            if (user) {
                next(new  InvalidRequestError('Already a user in the system by that name.'));
            } else {
                req.user = toUser(req);
                next();
            }
        }).catch(next);
    }
}

function validateLogin(req, res, next) {
    const payload = req.body;
    if (!payload.userName || payload.userName === '') {
        next(InvalidRequestError.newParamValidationError('userName or password'))
    } else if (!payload.password || payload.password === '') {
        next(InvalidRequestError.newParamValidationError('userName or password'))
    } else {
        req.user = toUser(req);
        next();
    }
}

function validateChangePassword(req, res, next) {
    const payload = req.body;
    const newPassword = payload.newPassword;
    const oldPassword = payload.oldPassword;
    const userId = payload.userId;
    const user = req.user;

    if (!oldPassword) {
        next(InvalidRequestError.newParamValidationError('oldPassword'));
    } else if (!newPassword) {
        next(InvalidRequestError.newParamValidationError('newPassword'));
    } else if (!utils.isValidSequenceId(userId)) {
        next(InvalidRequestError.newParamValidationError('userId'));
    } else if (user.admin === true || userId === user._id) {
        next();
    } else {
        next(InvalidRequestError.newParamValidationError('userId'));
    }

}


function toUser(req) {
    return {userName:req.body.userName, password:req.body.password};
}