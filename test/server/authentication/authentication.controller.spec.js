/**
 * Created by rotaylor on 8/26/2017.
 */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const sinon = require('sinon');
const HttpStatus = require('http-status-codes');

const SERVER_ROOT = '../../../app/server';
const authService = require(SERVER_ROOT + '/authentication/authentication.service');
const authController = require(SERVER_ROOT + '/authentication/authentication.controller');
const token = 'token';
const sandbox = sinon.sandbox.create();
let req, res, next;

describe('Authentication Controller Test Suite', (done) =>{

    beforeEach( () =>{
        sandbox.restore();
        req = {
            body: {},
            query: {},
            headers: {}
        };
        res = {};
        next = ()=>{};

    });

    it ('should fail to authenticate due to missing token', (done) =>{

        next = (err) =>{
            expect(err.status).to.equal(HttpStatus.UNAUTHORIZED);
            expect(err.message).to.equal(authController.MSG_NO_TOKEN_PROVIDED);
            done();
        };

        authController.authenticate(req, res, next);
    });

    it ('should fail to authenticate due to invalid token', (done) =>{
        req.headers[authController.HEADER_ACCESS_TOKEN] = token;
        const err = new Error('Invalid token');
        sandbox.stub(authService, 'verifyAuthToken').callsFake( (t) =>{
            expect(t).to.equal(token);
            return Promise.reject(err);
        });

        next = (err) =>{
            expect(err.status).to.equal(HttpStatus.UNAUTHORIZED);
            expect(err.message).to.equal(authController.MSG_UNABLE_TO_VERIFY_TOKEN);
            done();
        };

        authController.authenticate(req, res, next);
    });

    it ('should fail to authenticate due to expired token', (done) =>{
        req.headers[authController.HEADER_ACCESS_TOKEN] = token;
        const err = {name:'TokenExpiredError'};
        sandbox.stub(authService, 'verifyAuthToken').callsFake( (t) =>{
            expect(t).to.equal(token);
            return Promise.reject(err);
        });

        next = (err) =>{
            expect(err.status).to.equal(HttpStatus.UNAUTHORIZED);
            expect(err.message).to.equal(authController.MSG_TOKEN_EXPIRED);
            done();
        };

        authController.authenticate(req, res, next);
    });

    it ('should successfully authenticate', (done) =>{
        req.headers[authController.HEADER_ACCESS_TOKEN] = token;
        const err = new Error('Invalid token');
        sandbox.stub(authService, 'verifyAuthToken').callsFake( (t) =>{
            expect(t).to.equal(token);
            return Promise.resolve(token);
        });


        next = () =>{
            expect(req.user).to.equal(token);
            done();
        };

        authController.authenticate(req, res, next);
    });


});