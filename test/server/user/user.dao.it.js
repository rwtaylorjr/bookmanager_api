/**
 * Created by rotaylor on 8/13/2017.
 */
'use strict';

const chai = require('chai');
const expect = chai.expect;

const SERVER_ROOT = '../../../app/server';
const db = require(SERVER_ROOT +'/db');
const utils = require(SERVER_ROOT + '/utils');
const dao = require(SERVER_ROOT + '/user/user.dao');


describe('User DAO Integration Test Suite', function(){

    before( (done) => {
        db.init()
            .then(db.setup)
            .then(done)
            .catch ( (err) =>{
            db.close();
            done();
        })
    });

    after((done) => {
        db.tearDown().then(db.close).then(done).catch(done);
    });

    afterEach((done) => {
        dao.removeAll().then(()=>{
            done();
        }).catch(done);
    });

    it('should create new user', (done) =>{
        let doc = {userName:'myUser', password:'password'};
        dao.create(doc).then((result)=> {
            expect(result._id).to.not.be.null;
            expect(result.userName, 'user userName should be myUser').to.equal('myUser');
            expect(result.password, 'user password should be password').to.equal('password');
            done();
        }).catch(done);
    })

    it('should update user', (done) =>{
        let doc = {userName:'myUser', password:'password'};
        let userId;
        dao.create(doc).then((result)=> {
            userId = result._id;
            return dao.update(userId, {password:'newPassword'});
        }).then((result)=>{
            return dao.get(userId);
        }).then((updatedUser) =>{
            expect(updatedUser._id).to.not.be.null;
            expect(updatedUser.userName, 'user userName should be myUser').to.equal('myUser');
            expect(updatedUser.password, 'user password should be password').to.equal('newPassword');
            done();
        }).catch(done);
    });

    it('should fail to update user', (done) =>{
        let doc = {userName:'myUser', password:'password'};
        let userId;
        const invalidUserId = -1;
        dao.create(doc).then((result)=> {
            userId = result._id;
            return dao.update(invalidUserId, {password:'newPassword'});
        }).catch( (err) =>{
            expect(err).to.equal(false);
            done();
        });
    });

    it('should get user', (done) =>{
        let doc = {userName:'myUser', password:'password'};
        dao.create(doc).then((result)=> {
            return dao.get(result._id);
        }).then((result)=>{
            expect(result._id).to.not.be.null;
            expect(result.userName, 'user userName should be myUser').to.equal('myUser');
            expect(result.password, 'user password should be password').to.equal('password');
            done();
        }).catch(done);
    })

    it('should find user by userName', (done) =>{
        let doc = {userName:'myUser', password:'password'};
        dao.create(doc).then((user) => {
                return dao.findByUserName(user.userName);
            }).then((result)=> {
                expect(result._id).to.not.be.null;
                expect(result.userName, 'user userName should be myUser').to.equal('myUser');
                expect(result.password, 'user password should be password').to.equal('password');
                done();
            }).catch(done);
    })

    it ('should delete a user', (done) => {
        let doc = {userName:'myUser', password:'password'};
        let userId;
        dao.create(doc).then((user) => {
            userId = user._id;
            return dao.remove(user._id);
        }).then((result)=> {
            return dao.get(userId);
        }).then( (user) => {
            expect(user).to.be.undefined;
            done();
        }).catch(done);
    });



});

