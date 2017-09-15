/**
 * Created by rotaylor on 7/30/2017.
 */
    'use strict';
const BaseError = require('./base-error');
const HttpStatus = require('http-status-codes');
module.exports = class AppError extends BaseError {
    constructor (message, status, code) {

        // Calling parent constructor of base Error class.
        super(message, code);

        // You can use any additional properties you want.
        // I'm going to use preferred HTTP status for this error types.
        // `500` is the default value if not specified.
        this.status = status || HttpStatus.INTERNAL_SERVER_ERROR;



    }

};
