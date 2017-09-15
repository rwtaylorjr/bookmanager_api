/**
 * Created by rotaylor on 8/18/2017.
 */
    'use strict';

const BaseError = require('../errors/base-error');
const USER_NOT_FOUND = 'USER_NOT_FOUND';
const PASSWORD_MISMATCH = 'PASSWORD_MISMATCH';

module.exports = class UserError extends BaseError {

    constructor (message, code) {
        "use strict";

        // Calling parent constructor of base Error class.
        super(message, code);


    }

    static get USER_NOT_FOUND() {
        return USER_NOT_FOUND;
    }

    static get PASSWORD_MISMATCH() {
        return PASSWORD_MISMATCH;
    }

    static newUserNotFoundError(userId) {
        return new UserError('User not found under ' + userId, UserError.USER_NOT_FOUND);
    }

    static newPasswordMismatchError(password) {
        return new UserError('Password doesn\'t match existing password.', UserError.PASSWORD_MISMATCH);
    }
};