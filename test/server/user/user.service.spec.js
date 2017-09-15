/**
 * Created by rotaylor on 8/11/2017.
 */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const sinon = require('sinon');

const SERVER_ROOT = '../../../app/server';
const utils = require(SERVER_ROOT + '/utils');
const userService = require(SERVER_ROOT + '/user/user.service');
const userDao = require(SERVER_ROOT + '/user/user.dao');
const UserError = require(SERVER_ROOT + '/user/user-error');
const hashUtils = require(SERVER_ROOT + '/hashUtils');

let sandbox;

describe('User Service Test Suite', (done) => {
    beforeEach(()=>{
        sandbox = sinon.sandbox.create();
    });

    afterEach(function(){
        sandbox.restore();
    });


    it ('should create a new user', (done) =>{
        const expected = 1;
        const newUser = {userName:'Test', password: 'TestP'};

        // Mock
        sandbox.stub(userDao, 'create').callsFake((user) => {
            // clone to emulate db
            const u = utils.cloneObject(user);
            u._id = expected;
            return Promise.resolve(u);
        });

        userService.createUser(newUser).then((user)=>{
            expect(user._id).to.equal(expected);
            expect(user.password).to.be.null;
            expect(userDao.create.calledOnce).to.equal(true);
            assert(userDao.create.calledWithMatch(newUser), 'userDao.create(...) should be called with ' + newUser);
            done();
        }).catch(done);

    });

    it ('should fail to login due to missing user', (done) =>{
        const creds = {userName:'Test', password: 'TestP'};

        // Mock
        sandbox.stub(userDao, 'findByUserName').callsFake(function(userName){
           return Promise.resolve(undefined);
        });

        // verify
        userService.login(creds).then((user)=>{
            done();
        }).catch((err) =>{
            expect(err.code).to.equal(UserError.USER_NOT_FOUND);
            expect(userDao.findByUserName.calledOnce).to.equal(true);
            assert(userDao.findByUserName.calledWithMatch(creds.userName), 'userDao.findByUserName(...) should be called with ' + creds.userName);
            done();
        });


    });

    it ('should fail to login due to password mismatch ', (done) =>{
        const creds = {userName:'Test', password: 'TestP'};
        const hashedPassword = hashUtils.hashSync('mmmmm');

        // Mock
        sandbox.stub(userDao, 'findByUserName').callsFake(function(userName){
            const user = utils.cloneObject(creds);
            user.password = hashedPassword;
            return Promise.resolve(user);
        });

        sandbox.spy(hashUtils, 'compare');

        // verify
        userService.login(creds).then((user)=>{
            done(new Error('Unexpected success while logging in'));
        }).catch((err) =>{
            expect(err.code).to.equal(UserError.PASSWORD_MISMATCH);
            expect(userDao.findByUserName.calledOnce).to.equal(true);
            assert(userDao.findByUserName.calledWithMatch(creds.userName), 'userDao.findByUserName(...) should be called with ' + creds.userName);
            expect(hashUtils.compare.calledOnce).to.equal(true);
            assert(hashUtils.compare.calledWithMatch(creds.password, hashedPassword) , 'hashUtils.compare(...) should be called with ' + creds.password + ', ' + hashedPassword);
            done();
        });
    });

    it ('should successfully login', (done) =>{
        const creds = {userName:'Test', password: 'TestP'};
        const hashedPassword = hashUtils.hashSync(creds.password);

        // Mock
        sandbox.stub(userDao, 'findByUserName').callsFake(function(userName){
            const user = utils.cloneObject(creds);
            user.password = hashedPassword;
            return Promise.resolve(user);
        });

        sandbox.spy(hashUtils, 'compare');

        // verify
        userService.login(creds).then((user)=>{
            expect(user.userName).to.equal(creds.userName);
            expect(user.password).to.be.null;
            expect(userDao.findByUserName.calledOnce).to.equal(true);
            assert(userDao.findByUserName.calledWithMatch(creds.userName), 'userDao.findByUserName(...) should be called with ' + creds.userName);
            expect(hashUtils.compare.calledOnce).to.equal(true);
            assert(hashUtils.compare.calledWithMatch(creds.password, hashedPassword) , 'hashUtils.compare(...) should be called with ' + creds.password + ', ' + hashedPassword);
            done();
        }).catch(done);

    });

    it ('should fail logging in due to underlying userDao error', (done) =>{
        const userName = 'Test';
        const errorMsg = 'Unexpected db error';
        const error = new Error(errorMsg);
        const creds = {userName:'Test', password: 'TestP'};
        const hashedPassword = hashUtils.hashSync(creds.password);

        // Mock
        sandbox.stub(userDao, 'findByUserName').callsFake( (userName) =>{
            return Promise.reject(error);
        });


        // verify
        userService.login(creds).then((user)=>{
            done(new Error('Unexpected success'));
        }).catch((err) =>{
            expect(err.message).to.equal(errorMsg);
            expect(userDao.findByUserName.calledOnce).to.equal(true);
            assert(userDao.findByUserName.calledWithMatch(userName), 'userDao.findByUserName(...) should be called with ' + userName);
            done();
        });


    });

    it ('should find user by user name', (done) =>{
        const userName = 'Test';
        const user = {userName:'Test', password: 'TestP'};

        sandbox.stub(userDao, 'findByUserName').callsFake( (userName) =>{
            return Promise.resolve(user);
        });

        userService.findUserByUserName(userName).then( (result) =>{
            expect(result).to.eql(user);
            expect(userDao.findByUserName.calledOnce).to.equal(true);
            assert(userDao.findByUserName.calledWithMatch(userName), 'userDao.findByUserName(...) should be called with ' + userName);
            done();
        }).catch(done);

    });

    it ('should fail finding user by user name due to underlying dao error', (done) =>{
        const userName = 'Test';
        const user = {userName:'Test', password: 'TestP'};
        const errorMsg = 'Unexpected db error';
        const error = new Error(errorMsg);


        sandbox.stub(userDao, 'findByUserName').callsFake( (userName) =>{
            return Promise.reject(error);
        });

        userService.findUserByUserName(userName).then( (result) =>{
            done(new Error('Unexpected success'));
        }).catch((err) =>{
            expect(err.message).to.equal(errorMsg);
            expect(userDao.findByUserName.calledOnce).to.equal(true);
            assert(userDao.findByUserName.calledWithMatch(userName), 'userDao.findByUserName(...) should be called with ' + userName);
            done();
        });

    });


    it ('should fail to update password because associated user not found under specified user id', (done) =>{
        const userId = 1;
        const oldPassword = 'TestP';
        const newPassword = 'TestX';

        sandbox.stub(userDao, 'get').callsFake( (userId) =>{
            return Promise.resolve(undefined);
        });

        userService.changePassword(userId, oldPassword, newPassword).then( (result) =>{
            done();
        }).catch((err) => {
            expect(err.code).to.equal(UserError.USER_NOT_FOUND);
            expect(userDao.get.calledOnce).to.equal(true);
            assert(userDao.get.calledWithMatch(userId), 'userDao.get(...) should be called with ' + userId);
            done();
        });
    });

    it ('should fail to update password because old password doesnt match current password', (done) =>{
        const userId = 1;
        const oldPassword = 'TestP';
        const newPassword = 'TestX';

        sandbox.stub(userDao, 'get').callsFake( (userId) =>{
            return Promise.resolve(undefined);
        });

        userService.changePassword(userId, oldPassword, newPassword).then( (result) =>{
            done();
        }).catch((err) => {
            expect(err.code).to.equal(UserError.USER_NOT_FOUND);
            expect(userDao.get.calledOnce).to.equal(true);
            assert(userDao.get.calledWithMatch(userId), 'userDao.get(...) should be called with ' + userId);
            done();
        });
    });

    it ('should update the password', (done) =>{
        const userId = 1;
        const oldPassword = 'TestP';
        const newPassword = 'TestX';
        const user = {_id:userId, password:oldPassword};

        sandbox.stub(userDao, 'get').callsFake( (userId) =>{
            return Promise.resolve(user);
        });

        sandbox.stub(hashUtils, 'compare').callsFake( (newValue, currentValue) =>{
            return Promise.resolve(true);
        });

        sandbox.stub(userDao, 'update').callsFake( (userId, payload) =>{
            return Promise.resolve(true);
        });

        userService.changePassword(userId, oldPassword, newPassword).then( (result) =>{
            expect(result).to.equal(true);
            expect(userDao.get.calledOnce).to.equal(true);
            assert(userDao.get.calledWithMatch(userId), 'userDao.get(...) should be called with ' + userId);
            expect(hashUtils.compare.calledOnce).to.equal(true);
            assert(hashUtils.compare.calledWithMatch(oldPassword, oldPassword), 'hashUtils.compare(...) should be called with ' + oldPassword + ', ' + oldPassword);
            expect(userDao.update.calledOnce).to.equal(true);
            const updatePayload = {password:newPassword};
            assert(userDao.update.calledWithMatch(userId, updatePayload), 'userDao.update(...) should be called with ' + userId + ', ' + updatePayload);
            done();
        }).catch(done);
    });


});
