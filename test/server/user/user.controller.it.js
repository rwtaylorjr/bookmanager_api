/**
 * Created by rotaylor on 1/22/2017.
 */
"use strict";
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const HttpStatus = require('http-status-codes');


const testUtils = require('../testUtils');
const SERVER_ROOT = '../../../app/server';
const server = require(SERVER_ROOT);
const db = require(SERVER_ROOT +'/db');
const utils = require(SERVER_ROOT + '/utils');
const userService = require(SERVER_ROOT +'/user/user.service');
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';
const TEST_USER_NAME = 'Test';
const TEST_USER_PASSWORD = 'TestP';
const api = '/api/users';
const app = server.init();
const commonHeaders = testUtils.getCommonHeaders();

describe('User Controller API Tests', function(){

    before( (done) => {
        db.init()
            .then(db.setup)
            .then(done)
            .catch ( (err) =>{
            db.close();
            done(err);
        })
    });



    after((done) => {
        db.tearDown().then(db.close).then(done).catch(done);
    });


    describe('POST /login ', (done) => {
        const loginApi = api + '/login';
        before((done) => {
            createTestUser(done);
        });

        after( (done) =>{
            //console.log('deleting test user');
            deleteTestUser(done);
        });

        it('should fail to login due to missing username and password', function (done) {
            const input = {};
            request(app)
                .post(loginApi)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST
            )
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should fail to login due to missing username', function (done) {
            const input = {password:'TestP'};
            request(app)
                .post(loginApi)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should fail to login due to missing password', function (done) {
            const input = {userName:'Test'};
            request(app)
                .post(loginApi)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should fail to login caused by user not found', function (done) {
            const input = {userName:'Test1', password:'TestP'};
            request(app)
                .post(loginApi)
                .send(input)
                .expect(HttpStatus.FORBIDDEN)
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should fail to login caused by password mismatch', function (done) {
            const input = {userName:'Test1', password:'TestPX'};
            request(app)
                .post(loginApi)
                .send(input)
                .expect(HttpStatus.FORBIDDEN)
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should successfully login', function (done) {
            const input = getTestUserLiteral();
            request(app)
                .post(loginApi)
                .send(input)
                .expect(HttpStatus.MOVED_TEMPORARILY)
                .expect('Content-Type', /json/)
                .end( (err, res) =>{
                    if (err) {
                        console.log(res.error);
                        return done(err);
                    } else {
                        expect(res.token).is.not.null;
                        done();
                    }

                });
        });

    });

    describe('POST /users', (done) => {
        const registerApi = api + '/register';

        after( (done) =>{
            //console.log('deleting test user');
            deleteTestUser(done);
        });

        it('should fail to create new user due to missing username and password', function (done) {
            const input = {};
            request(app)
                .post(registerApi)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should fail to create new user due to missing username', function (done) {
            const input = {password:'TestP'};
            request(app)
                .post(registerApi)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should fail to create new user due to missing password', function (done) {
            const input = {userName:'Test'};
            request(app)
                .post(registerApi)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);
        });

        it('should successfully create a new user', function (done) {
            const input = getTestUserLiteral()
            request(app)
                .post(registerApi)
                .send(input)
                .expect(HttpStatus.CREATED)
                .expect('Content-Type', /json/)
                .end(done);
        });


    });

    describe('PUT /users/:id', (done) => {

        const userId = 2;
        const changePasswordApi = api + '/' + userId;
        before( (done) =>{
            createTestUser(done);
        });

        after( (done) =>{
            //console.log('deleting test user');
            deleteTestUser(done);
        });

        it ('should fail to change password due to missing oldPassword', (done) =>{
            const input = {userId:2, oldPassword:'TestP', newPassword:'TestX'};
            request(app)
            .post(changePasswordApi)
            done();
        });

        it ('should fail to change password due to missing newPassword', (done) =>{
            done();
        });

        it ('should fail to change password due to missing userId', (done) =>{
            done();
        });

        it ('should fail to change password due to missing invalid userId', (done) =>{
            done();
        });

        it ('should fail to change password due mismatch with logged in user and userId', (done) =>{
            done();
        });


    });





});


function getTestUserLiteral() {
    return {userName: TEST_USER_NAME, password: TEST_USER_PASSWORD};
}

function createTestUser(done) {
    const user = getTestUserLiteral();
    userService.createUser(user).then( (u) =>{
        done();
    }).catch(done);
}

function deleteTestUser(done) {
    userService.findUserByUserName(TEST_USER_NAME).then( (user) =>{
        userService.removeUser(user._id).then( ()=>{
            done();
        }).catch(done)
    }).catch(done);
}