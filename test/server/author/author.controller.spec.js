/**
 * Created by rotaylor on 1/29/2017.
 *
 * Unit test suilte for the AuthorController
 *
 */
'use strict';
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const HttpStatus = require('http-status-codes');
const sinon = require('sinon');

const SERVER_ROOT = '../../../app/server';
const utils = require(SERVER_ROOT + '/utils');
const InvalidRequestError = require(SERVER_ROOT + '/errors/invalid-request-error');
const modulePath = SERVER_ROOT + '/author';
const authorControllerModulePath = modulePath + '/authors.controller';
const authorServiceModulePath = modulePath + '/author.service';
const authorController = require(authorControllerModulePath);
const authorService = require(authorServiceModulePath);
const bookService = require(SERVER_ROOT + '/book/book.service');
const sandbox = sinon.sandbox.create();
const TEST_DATE_STRING = '12-05-2011';
const testDate = utils.parseDate(TEST_DATE_STRING);
const USER_ID = 1;

describe('Author Controller Unit Test Suite', function(){

    describe('Test validate operations', function(){
        let req, res, next;

        beforeEach(function(){
            res = {};
            req = {
                body:{},
                user:{_id:USER_ID}
            };
            req.query = {};

            next = function() {

            }
        });

        afterEach(function(){
            sandbox.restore();
        });
        it('is missing name parameter from create request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [name] must be defined and non-empty');
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            authorController.validateCreate(req, res, next);
            expect(req.author).to.be.undefined;
        });

        it('is missing dob parameter from create request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [dob] must be defined and non-empty');
            req = {body:{name:'My Author'}};
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            authorController.validateCreate(req, res, next);
            expect(req.author).to.be.undefined;
        });

        it('is invalid dob format parameter from create request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [dob] must be defined and non-empty');
            req = {body:{name:'My Author',dob:'12-'}};
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            authorController.validateCreate(req, res, next);
            expect(req.author).to.be.undefined;
        });

        it('is missing name parameter from update request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [name] must be defined and non-empty');
            req = {body:{id:2}};
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            authorController.validateUpdate(req, res, next);
            expect(req.author).to.be.undefined;
        });

        it('is missing id parameter from update request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [id] must be defined and non-empty');
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            authorController.validateUpdate(req, res, next);
            expect(req.author).to.be.undefined;
        });

        it('is missing dob parameter from update request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [dob] must be defined and non-empty');
            req = {body:{id:2, name:'My Author'}};
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            authorController.validateUpdate(req, res, next);
            expect(req.author).to.be.undefined;
        });

        it('is invalid dob format parameter from update request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [dob] must be defined and non-empty');
            req = {body:{id:2, name:'My Author',dob:'12-'}};
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            authorController.validateUpdate(req, res, next);
            expect(req.author).to.be.undefined;
        });

        it('is valid create request', function(done){
            const expectedDob = testDate;
            req = {body:{name:'My title', dob:TEST_DATE_STRING}};
            authorController.validateCreate(req, res, next);
            expect(req.author.name).to.equal('My title');
            expect(req.author.dob).to.eql(expectedDob);
            done();
        });

        it('is valid update request', function(done){
            const expectedDob = testDate;
            req = {body:{id:2, name:'My title', dob:TEST_DATE_STRING}};
            authorController.validateUpdate(req, res, next);
            expect(req.author.name).to.equal('My title');
            expect(req.author.dob).to.eql(expectedDob);
            done();
        });

        it('is delete request with invalid author identities', (done) =>{
            const expected = new InvalidRequestError(authorController.INVALID_AUTHOR_IDS);
            req.body.ids = [1, 2, 'a'];

            next = (error) => {
                expectErrorToEqual(error, expected);
                done();
            };

            authorController.validateDelete(req, res, next);


        });

        it('is delete request with referenced books', (done) =>{
            req.body.ids = [1,2,3];
            const expected = [{title:'Book1'},{title:'Book2'},{title:'Book3'}];

            sandbox.stub(bookService, 'findBooks').callsFake( (query)=>{
                return Promise.resolve(expected);
            });

            res.status = (statusCode)=>{
                expect(statusCode).to.equal(HttpStatus.METHOD_NOT_ALLOWED);
                return res;
            };

            res.json = (payload) =>{
                expect(payload).to.eql(expected);
                done();
            };

            authorController.validateDelete(req, res, next);


        });

        it('is valid delete request', (done)=>{
            req.body.ids = [1,2,3];
            const expected = [];

            sandbox.stub(bookService, 'findBooks').callsFake( (query)=>{
                return Promise.resolve(expected);
            });

            next = () =>{
                done();
            };

            authorController.validateDelete(req, res, next);
        });
    });


    describe('Test CRUD operations', function() {
        let req, res, next;

        beforeEach(function(){
            res = {};
            req = {
                body:{},
                user:{_id:USER_ID}
            };
            req.query = {};

            next = function() {

            }
        });

        afterEach(function(){
            sandbox.restore();
        });

        it('gets a author specified by an id', function(done){
            // Prepare
            const expected = {};
            req.params = {id:'1'};

            // Mock
            sandbox.stub(authorService, 'getAuthor').callsFake(function(id){
                return Promise.resolve(expected);
            });

            // Run
            authorController.getAuthor(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload).to.equal(expected);
                done();
            };

            expect(authorService.getAuthor.calledOnce).to.equal(true);
            assert(authorService.getAuthor.calledWithMatch(1), 'authorService.getAuthor(...) should be called with id=1');
        });

        it('error getting a author specified by an id', function(done){
            // Prepare
            const expected = new Error('An error occurred getting author where id=1.');
            req.params = {id:'1'};
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            }

            // Mock
            sandbox.stub(authorService, 'getAuthor').callsFake(function(){
                return Promise.reject(expected);
            });

            // Run
            authorController.getAuthor(req,res, next);

            // Verify
            expect(authorService.getAuthor.calledOnce).to.equal(true);
            assert(authorService.getAuthor.calledWithMatch({}));
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });


        it('finds all authors', function(done){

            // Prepare
            const expected = [];

            // Mock
            sandbox.stub(authorService, 'findAuthors').callsFake(function(authors){
                return Promise.resolve(expected);
            });

            // Run
            authorController.findAuthors(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload).to.equal(expected);
                done();
            };

            expect(authorService.findAuthors.calledOnce).to.equal(true);
            assert(authorService.findAuthors.calledWithMatch({}));

        });

        it('error finding all authors', function(done){

            // Prepare
            const expected = new Error('An error occurred finding authors.');
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            }

            // Mock
            sandbox.stub(authorService, 'findAuthors').callsFake(function(){
                return Promise.reject(expected);
            });

            // Run
            authorController.findAuthors(req,res, next);

            // Verify
            expect(authorService.findAuthors.calledOnce).to.equal(true);
            assert(authorService.findAuthors.calledWithMatch({}));
            assert(res.send.notCalled);
            assert(res.status.notCalled);

        });


        it('error creating author', function(done) {

            // Prepare
            const expected = new Error('An error occurred creating author.');
            const author = {_id:null, name:'My Author', dob:TEST_DATE_STRING};
            req.author = author; // set by validateCreate(...)
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            };

            // Mock
            sandbox.stub(authorService, 'createAuthor').callsFake(function(userId, b){
                return Promise.reject(expected);
            });

            // Run
            authorController.createAuthor(req,res,next);

            // Verify
            expect(authorService.createAuthor.calledOnce).to.equal(true);
            assert(authorService.createAuthor.calledWithMatch(USER_ID, author), 'createAuthor called with author');
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });

        it('update author', function(done) {

            // Prepare
            const author = {_id:3, title:'Mi Author', dob:TEST_DATE_STRING};
            req.author = author;
            const expected = true;

            // Mock
            sandbox.stub(authorService, 'updateAuthor').callsFake(function(userId, b){
                // simulate data access layer returning a newly updated record
                return Promise.resolve(true);
            });

            // Run
            authorController.updateAuthor(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload.success).to.equal(expected);
                done();
            }
            expect(authorService.updateAuthor.calledOnce).to.equal(true);
            assert(authorService.updateAuthor.calledWithMatch(USER_ID, author), 'updateAuthor called with author');
        });

        it('error updating author', function(done) {

            // Prepare
            const expected = new Error('An error occurred updating author.');
            const author = {_id:3, title:'Mi Author', dob:TEST_DATE_STRING};
            req.author = author;
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            };

            // Mock
            sandbox.stub(authorService, 'updateAuthor').callsFake(function(userId, b){
                return Promise.reject(expected);
            });

            // Run
            authorController.updateAuthor(req,res, next);

            // Verify
            expect(authorService.updateAuthor.calledOnce).to.equal(true);
            assert(authorService.updateAuthor.calledWithMatch(USER_ID, author), 'updateAuthor called with author');
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });

        it('delete authors', function(done){
            // Prepare
            const expected = ['1','2'];
            req.body = {ids:expected};
            next = function(err) {
                done(err);
            }
            // Mock
            sandbox.stub(authorService, 'deleteAuthors').callsFake(function(ids){
                return Promise.resolve(true);
            });

            // Run
            authorController.deleteAuthors(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload).to.be.undefined;
                done();
            }
            expect(authorService.deleteAuthors.calledOnce).to.equal(true);
            //assert(authorService.deleteAuthors.calledWithMatch(expected), 'deleted called with author ids');
        });

        it('error deleting authors', function(done){

            // Prepare
            const expected = new Error('An error occurred deleting author(s).');
            const authorsToDelete = ['1','2'];
            res.send = sinon.spy();
            res.status = sinon.spy();
            req.body = {ids:authorsToDelete};
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            };

            // Mock
            sandbox.stub(authorService, 'deleteAuthors').callsFake(function(ids){
                return Promise.reject(expected);
            });

            // Run
            authorController.deleteAuthors(req,res, next);

            // Verify
            expect(authorService.deleteAuthors.calledOnce).to.equal(true);
            assert(authorService.deleteAuthors.calledWithMatch(authorsToDelete), 'deleted called with author ids');
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });

    });

    describe ('Test private utility operations', function(){

        it('toAuthor returns correct structure', function(done){
            const req = {body:{}};
            const KEY_COUNT = 3;
            const result = authorController.toAuthor(req);
            expect(Object.keys(result).length, KEY_COUNT);
            expect(result._id).to.be.null;
            expect(result.name).to.be.null;
            expect(result.dob).to.be.null;
            //assert.typeOf(result.dob, 'date');
            done();
        });

        it('converts request to author model for create request where id is not present', function(done) {
            const req = {body:{}};
            req.body = {name:'Author', dob:TEST_DATE_STRING};
            const expectedDOB = utils.parseDate(req.body.dob);
            const result = authorController.toAuthor(req);
            expect(result._id).to.be.null;
            expect(result.name).to.equal('Author');
            expect(result.dob).to.eql(expectedDOB);
            done();
        });

        it ('converts request to author model for update request where id is present', function(done) {
            const req = {body:{}};
            req.body = {id:1, name:'Author', dob:TEST_DATE_STRING};
            const expectedDOB = utils.parseDate(req.body.dob);
            const result = authorController.toAuthor(req);
            expect(result._id).to.equal(1);
            expect(result.name).to.equal('Author');
            expect(result.dob).to.eql(expectedDOB);
            done();
        });

    });

});

function expectErrorToEqual(actual, expected) {
    expect(actual.message).to.equal(expected.message);
    expect(actual.status).to.equal(expected.status);
}