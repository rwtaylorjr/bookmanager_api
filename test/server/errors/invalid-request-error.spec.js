/**
 * Created by rotaylor on 8/11/2017.
 */
"use strict";
const SERVER_ROOT = '../../../app/server';
const InvalidRequestError = require(SERVER_ROOT + '/errors/invalid-request-error');
const expect = require('chai').expect;
const HttpStatus = require('http-status-codes');
describe('Test suite for InvalidRequestError', () =>{

    it('should create a new instance with message and 400 status code', () =>{
        const ire = new InvalidRequestError('message');
        expect(ire.message).to.equal('message');
        expect(ire.status).to.equal(HttpStatus.BAD_REQUEST);

    });

    it('should create a new invalid request parameter error', () =>{
        const ire = InvalidRequestError.newParamValidationError('paramName');
        expect(ire.message).to.equal('Missing or invalid request parameter(s): [paramName] must be defined and non-empty');
        expect(ire.status).to.equal(HttpStatus.BAD_REQUEST);
    });
});