'use strict';

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const HttpStatus = require('http-status-codes');
const sinon = require('sinon');
const jwt = require ('jsonwebtoken');

const SERVER_ROOT = '../../../app/server';
const utils = require(SERVER_ROOT + '/utils');
const InvalidRequestError = require(SERVER_ROOT + '/errors/invalid-request-error');
const AppError = require(SERVER_ROOT + '/errors/app-error');
const controller = require(SERVER_ROOT +'/user/user.controller');
const userService = require(SERVER_ROOT + '/user/user.service');
const UserError = require(SERVER_ROOT + '/user/user-error');
const authService = require(SERVER_ROOT + '/authentication/authentication.service');

let req, res, next;
const sandbox = sinon.sandbox.create();

describe('User Controller Test Suite', (done)=>{

    beforeEach(()=>{
        res = {};
        req = {body:{}};
        next = undefined;
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('Test CRUD operations', (done) =>{

        it('should create a new user', (done) =>{
            req.user = {userName:'Test', password: 'TestP'};
            const expected = 1;

            // Mock
            sandbox.stub(userService, 'createUser').callsFake(function(user){
                user._id = expected;
                return Promise.resolve(user);
            });

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.CREATED);
                return res;
            };

            res.json = function(payload) {
                expect(payload).to.be.undefined;
                done();
            }

            controller.createUser(req, res, next);

            // Verify
            expect(userService.createUser.calledOnce).to.equal(true);
            assert(userService.createUser.calledWithMatch(req.user), 'userService.createUser(...) should be called with ' + req.user);
        });

        it('should not create a new user', (done) =>{
            req.user = {userName:'Test', password: 'TestP'};
            const errMsg = 'Error creating new user';

            // Mock
            sandbox.stub(userService, 'createUser').callsFake(function(user){
                return Promise.reject(new AppError(errMsg, HttpStatus.INTERNAL_SERVER_ERROR));
            });

            // Verify
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.INTERNAL_SERVER_ERROR);
                expect(err.message).to.equal(errMsg);
                done();
            };

            controller.createUser(req, res, next);

            // Verify
            expect(userService.createUser.calledOnce).to.equal(true);
            assert(userService.createUser.calledWithMatch(req.user), 'userService.createUser(...) should be called with ' + req.user);
        });

        it('should fail to login due to user not found', (done) =>{
            req.user = {userName:'Test', password: 'TestP'};
            const errMsg = 'No user found under specified user name.';

            // Mock
            sandbox.stub(userService, 'login').callsFake(function(user){
                return Promise.reject(UserError.newUserNotFoundError(user.userName));
            });

            // Verify
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.FORBIDDEN);
                expect(err.message).to.equal(errMsg);
                done();
            };

            controller.login(req, res, next);

            // Verify
            expect(userService.login.calledOnce).to.equal(true);
            assert(userService.login.calledWithMatch(req.user), 'userService.login(...) should be called with ' + req.user);
        });

        it('should fail to login due to password mismatch', (done) =>{
            req.user = {userName:'Test', password: 'TestP'};
            const errMsg = 'Passwords did not match.';

            // Mock
            sandbox.stub(userService, 'login').callsFake(function(user){
                return Promise.reject(UserError.newPasswordMismatchError(user.password));
            });

            // Verify
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.FORBIDDEN);
                expect(err.message).to.equal(errMsg);
                done();
            };

            controller.login(req, res, next);

            // Verify
            expect(userService.login.calledOnce).to.equal(true);
            assert(userService.login.calledWithMatch(req.user), 'userService.login(...) should be called with ' + req.user);
        });

        it('should succesfully login', (done) =>{
            const user = {userName:'Test', password: 'TestP'};
            req.user = user;
            const errMsg = 'Passwords did not match.';

            // Mock
            sandbox.stub(userService, 'login').callsFake(function(user){
                user._id = 1;
                return Promise.resolve(user);
            });

            sandbox.stub(authService, 'createAuthToken').callsFake( (user) =>{
                return 'token';
            });

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.MOVED_TEMPORARILY);
                return res;
            };

            res.json = function(payload) {
                expect(payload.token).to.equal('token');
                done();
            }

            controller.login(req, res, next);

            // Verify
            expect(userService.login.calledOnce).to.equal(true);
            assert(userService.login.calledWithMatch(req.user), 'userService.login(...) should be called with ' + req.user);
        });

        it('should fail to login due to unknown system error', (done) =>{
            req.user = {userName:'Test', password: 'TestP'};
            const errMsg = 'Some unexpected error';

            // Mock
            sandbox.stub(userService, 'login').callsFake(function(user){
                return Promise.reject(new Error(errMsg));
            });

            // Verify
            next = function(err) {
                expect(err.message).to.equal(errMsg);
                done();
            };

            controller.login(req, res, next);

            // Verify
            expect(userService.login.calledOnce).to.equal(true);
            assert(userService.login.calledWithMatch(req.user), 'userService.login(...) should be called with ' + req.user);
        });

        it('should fail to change password due unknown system error', (done) =>{
            req.user = {_id:1, userName:'Test', password:'TestP'};
            req.body.id = 1;
            req.body.oldPassword = 'TestP';
            req.body.newPassword = 'TestX';
            const errMsg = 'Some unexpected error';

            // Mock
            sandbox.stub(userService, 'changePassword').callsFake(function(userId, oldPassword, newPassword){
                return Promise.reject(new Error(errMsg));
            });

            // Verify
            next = function(err) {
                expect(err.message).to.equal(errMsg);
                done();
            };

            controller.changePassword(req, res, next);

            // Verify
            expect(userService.changePassword.calledOnce).to.equal(true);
            assert(userService.changePassword.calledWithMatch(req._id, req.body.oldPassword, req.body.newPassword),
                'userService.changePassword(...) should be called with ' + req.body._id + ', ' + req.body.oldPassword + ', ' + req.body.newPassword);
        });


        it('should successfully change password', (done) =>{
            req.user = {_id:2, userName:'Test', password:'TestP'};
            req.body.id = 2;
            req.body.oldPassword = 'TestP';
            req.body.newPassword = 'TestX';


            // Mock
            sandbox.stub(userService, 'changePassword').callsFake(function(userId, oldPassword, newPassword){
                return Promise.resolve(true);
            });

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };

            res.json = function(payload) {
                expect(payload).to.eql({success:true});
                done();
            }

            controller.changePassword(req, res, next);

            // Verify
            expect(userService.changePassword.calledOnce).to.equal(true);
            assert(userService.changePassword.calledWithMatch(req._id, req.body.oldPassword, req.body.newPassword),
                'userService.changePassword(...) should be called with ' + req.body._id + ', ' + req.body.oldPassword + ', ' + req.body.newPassword);
        });


    });

    describe('Test validate operations', (done)=>{
        const invalidCreateRequestMsg = 'Missing or invalid request parameter(s): [userName or password] must be defined and non-empty';

        it('should validate create with missing username', (done)=>{
            req.body.password = 'test';
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal(invalidCreateRequestMsg);
                done();
            };
            controller.validateCreate(req, res, next);
        });

        it('should validate create with missing password', (done)=>{
            req.body.userName = 'test';
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal(invalidCreateRequestMsg);
                done();
            };
            controller.validateCreate(req, res, next);
        });

        it('should validate create with missing username and  password', (done)=>{

            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal(invalidCreateRequestMsg);
                done();
            };
            controller.validateCreate(req, res, next);
        });

        it('should validate create with duplicate user name', (done)=>{
            // Prepare
            const expected = {userName:'Test',password:'Test', admin:false};
            req.body.userName = 'Test';
            req.body.password = 'Test';

            // Mock
            sandbox.stub(userService, 'findUserByUserName').callsFake(function(userName){
                return Promise.resolve(expected);
            });

            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal('Already a user in the system by that name.');
                done();
            };

            // Run
            controller.validateCreate(req,res, next);

            // Verify
            expect(userService.findUserByUserName.calledOnce).to.equal(true);
            assert(userService.findUserByUserName.calledWithMatch('Test'), 'userService.findUserByUserName(...) should be called with userName=Test');
        });

        it('should validate create with valid user name and password', (done)=>{
            // Prepare
            const expected = {userName:'Test',password:'Test', admin:false};
            req.body.userName = 'Test';
            req.body.password = 'Test';

            // Mock
            sandbox.stub(userService, 'findUserByUserName').callsFake(function(userName){
                return Promise.resolve(undefined);
            });

            next = function(err) {
                done();
            };

            // Run
            controller.validateCreate(req,res, next);

            // Verify
            expect(userService.findUserByUserName.calledOnce).to.equal(true);
            assert(userService.findUserByUserName.calledWithMatch('Test'), 'userService.findUserByUserName(...) should be called with userName=Test');
        });


        it('should fail to validate update with missing oldPassword', (done)=>{

            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal('Missing or invalid request parameter(s): [oldPassword] must be defined and non-empty');
                done();
            };
            controller.validateChangePassword(req, res, next);
        });

        it('should fail to validate update with missing newPassword', (done)=>{
            req.body.oldPassword = 'TestP';
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal('Missing or invalid request parameter(s): [newPassword] must be defined and non-empty');
                done();
            };
            controller.validateChangePassword(req, res, next);
        });

        it('should fail to validate update with missing userId', (done)=>{
            req.body.oldPassword = 'TestP';
            req.body.newPassword = 'TestX';

            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal('Missing or invalid request parameter(s): [userId] must be defined and non-empty');
                done();
            };
            controller.validateChangePassword(req, res, next);
        });

        it('should fail to validate update with invalid userId', (done)=>{
            req.body.oldPassword = 'TestP';
            req.body.newPassword = 'TestX';
            req.body.userId = 'c';

            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal('Missing or invalid request parameter(s): [userId] must be defined and non-empty');
                done();
            };
            controller.validateChangePassword(req, res, next);
        });

        it('should fail to validate update with userId not match logged in user id and logged in user not admin', (done)=>{
            req.body.oldPassword = 'TestP';
            req.body.newPassword = 'TestX';
            req.body.userId = 2;
            req.user = {_id:3, userName:' Test', password: 'TextP', isAdmin: false};

            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal('Missing or invalid request parameter(s): [userId] must be defined and non-empty');
                done();
            };
            controller.validateChangePassword(req, res, next);
        });



        it('should validate update with valid password', (done)=>{
            // Prepare
            req.body.oldPassword = 'TestP';
            req.body.newPassword = 'TestX';
            req.body.userId = 2;
            req.user = {_id:2, userName:' Test', password: 'TextP', isAdmin: false};

            // success: next called without an error
            next = function(err) {
                expect(err).to.be.undefined;
                done();
            };

            // Run
            controller.validateChangePassword(req,res, next);

        });

        it('should validate admin updating password for a user', (done)=>{
            // Prepare
            req.body.oldPassword = 'TestP';
            req.body.newPassword = 'TestX';
            req.body.userId = 2;
            req.user = {_id:1, userName:' Test', password: 'TextP', admin: true};

            // success: next called without an error
            next = function(err) {
                expect(err).to.be.undefined;
                done();
            };

            // Run
            controller.validateChangePassword(req,res, next);

        });

        it('should validate login with missing user name', (done)=>{
            req.body.password = 'test';
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal(invalidCreateRequestMsg);
                done();
            };
            controller.validateLogin(req, res, next);
        });

        it('should validate login with missing password', (done)=>{
            req.body.userName = 'test';
            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal(invalidCreateRequestMsg);
                done();
            };
            controller.validateLogin(req, res, next);
        });

        it('should validate login with missing username and  password', (done)=>{

            next = function(err) {
                expect(err.status).to.equal(HttpStatus.BAD_REQUEST);
                expect(err.message).to.equal(invalidCreateRequestMsg);
                done();
            };
            controller.validateLogin(req, res, next);
        });

    });

    describe('Test private utility operations', (done) =>{

        it('should convert request to a User object', () =>{
            const req = {body:{userName:'TestUser', password:'TestPassword'}};
            const user = controller.toUser(req);
            expect(user.userName).to.equal(req.body.userName);
            expect(user.password).to.equal(req.body.password);
        });
    });
});
