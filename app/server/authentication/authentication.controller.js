/**
 * Created by rotaylor on 8/26/2017.
 */
'use strict';
const HttpStatus = require('http-status-codes');
const authService = require('./authentication.service');
const AppErr = require('../errors/app-error');
const HEADER_ACCESS_TOKEN = 'x-access-token';
const MSG_UNABLE_TO_VERIFY_TOKEN = 'Unable to verify token.';
const MSG_NO_TOKEN_PROVIDED = 'No token provided.';
const MSG_TOKEN_EXPIRED = 'Token expired.'
const ERROR_TOKEN_EXPIRED = 'TokenExpiredError';

module.exports = {
    MSG_UNABLE_TO_VERIFY_TOKEN:MSG_UNABLE_TO_VERIFY_TOKEN,
    MSG_NO_TOKEN_PROVIDED:MSG_NO_TOKEN_PROVIDED,
    MSG_TOKEN_EXPIRED:MSG_TOKEN_EXPIRED,
    HEADER_ACCESS_TOKEN:HEADER_ACCESS_TOKEN,
    authenticate: authenticate
};

function authenticate(req, res, next) {
    const token = req.headers[HEADER_ACCESS_TOKEN] || req.body.token || req.query.token;
    let msg;


    if (token) {

        authService.verifyAuthToken(token).then( (decoded) =>{
            req.user = decoded;
            next();
        }).catch( (err) =>{

            if (err.name === ERROR_TOKEN_EXPIRED) {
                msg = MSG_TOKEN_EXPIRED;
            } else {
                msg = MSG_UNABLE_TO_VERIFY_TOKEN;
            }

            next(new AppErr(msg, HttpStatus.UNAUTHORIZED));
        });


    } else {
        msg = MSG_NO_TOKEN_PROVIDED;
        next(new AppErr(msg, HttpStatus.UNAUTHORIZED));

    }

}