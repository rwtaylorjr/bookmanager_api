/**
 * Created by rotaylor on 8/25/2017.
 */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const sinon = require('sinon');
const jwt = require ('jsonwebtoken');

const SERVER_ROOT = '../../../app/server';
const authService = require(SERVER_ROOT + '/authentication/authentication.service');
const sandbox = sinon.sandbox.create();

describe('Authentication Service Test Suite', (done) =>{

    beforeEach(()=>{
        sandbox.restore();
    });

    it ('should create auth token', (done) =>{
        const user = {_id:1, userName:'Test', password:null};
        const payload = {data:user};
        const token = 'token'
        const expected = token;
        const options = {expiresIn: authService.JWT_TIMEOUT};

        sandbox.stub(jwt, 'sign').callsFake( (p, secret, opts) =>{
            return token;
        });

        const actual = authService.createAuthToken(user);
        expect(expected).to.eql(actual);
        expect(jwt.sign.calledOnce).to.equal(true);
        assert(jwt.sign.calledWithMatch(payload, authService.JWT_SECRET, options),
            'jwt.sign(...) should be called with ' + payload + ', ' + authService.JWT_SECRET + ', ' + options);
        done();

    });



});
