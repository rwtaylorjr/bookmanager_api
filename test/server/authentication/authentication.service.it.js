/**
 * Created by rotaylor on 8/26/2017.
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

describe ('Authentication Service Integration Test Suite', (done) =>{

    beforeEach( () =>{
        sandbox.restore();
    });


    it ('should create auth token', (done) =>{
        sandbox.spy(jwt, 'sign');
        const user = {_id:1, userName:'Test', password:null};
        const payload = {data:user};
        const token = authService.createAuthToken(user);
        const options = {expiresIn: authService.JWT_TIMEOUT};

        expect(jwt.sign.calledOnce).to.equal(true);
        assert(jwt.sign.calledWithMatch(payload, authService.JWT_SECRET, options),
            'jwt.sign(...) should be called with ' + payload + ', ' + authService.JWT_SECRET + ', ' + options);

        jwt.verify(token, authService.JWT_SECRET, (err, decoded) => {
            expect(err).to.be.null;
            expect(decoded.data).to.eql(user);
            done();
        });
    });

    it ('fail to verify auth token due to mismatch', (done) =>{
        sandbox.spy(jwt, 'verify');
        const user = {_id:1, userName:'Test', password:null};
        const payload = {data:user};
        const badToken = 'bad';
        authService.createAuthToken(user);

        authService.verifyAuthToken(badToken).then( (user)=>{

        }).catch((err) =>{
            expect(err).to.not.be.null;
            expect(jwt.verify.calledOnce).to.equal(true);
            const callback = (err, decoded) =>{};
            assert(jwt.verify.calledWithMatch(badToken, authService.JWT_SECRET),
                'jwt.verify(...) should be called with ' + badToken + ', ' + authService.JWT_SECRET + ', ' + callback);
            done();
        });

    });

    it ('should verify auth token', (done) =>{
        sandbox.spy(jwt, 'verify');
        const user = {_id:1, userName:'Test', password:null};
        const payload = {data:user};
        const goodToken = authService.createAuthToken(user);

        authService.verifyAuthToken(goodToken).then( (decoded)=>{
            expect(decoded).to.eql(user);
            expect(jwt.verify.calledOnce).to.equal(true);
            const callback = (err, decoded) =>{};
            assert(jwt.verify.calledWithMatch(goodToken, authService.JWT_SECRET),
                'jwt.verify(...) should be called with ' + goodToken + ', ' + authService.JWT_SECRET + ', ' + callback);
            done();
        }).catch(done);

    });

});
