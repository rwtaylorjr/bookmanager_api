/**
 * Created by rotaylor on 7/30/2017.
 */
    'use strict';
module.exports = class BaseError extends Error {
    constructor (message, code) {

        // Calling parent constructor of base Error class.
        super(message);

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Error code can be translated into meaningful information
        this.code = code;

    }

};
