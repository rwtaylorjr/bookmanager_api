/**
 * Created by rotaylor on 7/30/2017.
 */
const AppErr = require('./app-error');
const HttpStatus = require('http-status-codes');
module.exports = class InvalidRequestError extends AppErr {
    constructor (message) {
        super(message, HttpStatus.BAD_REQUEST);
    }

    /**
     * Facilitates creating an Error message for missing or invalid request parameters.
     * @param param
     * @returns {Error}
     */
    static newParamValidationError(param) {
        const message = 'Missing or invalid request parameter(s): [' + param + '] must be defined and non-empty';
        return new InvalidRequestError(message);
    }
};