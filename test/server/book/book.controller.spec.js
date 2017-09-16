/**
 * Created by rotaylor on 1/29/2017.
 *
 * Unit test suilte for the BookController
 *
 */
'use strict';
const SERVER_ROOT = '../../../app/server';
const utils = require(SERVER_ROOT + '/utils');
const InvalidRequestError = require(SERVER_ROOT + '/errors/invalid-request-error');
const Promise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const HttpStatus = require('http-status-codes');
const sinon = require('sinon');
const modulePath = SERVER_ROOT + '/book';
const bookControllerModulePath = modulePath + '/books.controller';
const bookServiceModulePath = modulePath + '/book.service';
const bookController = require(bookControllerModulePath);
const bookService = require(bookServiceModulePath);
const sandbox = sinon.sandbox.create();
const USER_ID = 1;

describe('Book Controller Unit Test Suite', function(){

    describe('Test validate operations', function(){

        it('is missing title parameter from create request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [title] must be defined and non-empty');
            let req, res, next;
            req = {
                body:{},
                user:{_id:USER_ID}
            };
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            bookController.validateCreate(req, res, next);
            expect(req.book).to.be.undefined;
        });

        it('is missing title parameter from update request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [title] must be defined and non-empty');
            let req, res, next;
            req = {body:{id:'2'}};
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            bookController.validateUpdate(req, res, next);
            expect(req.book).to.be.undefined;
        });

        it('is missing id parameter from update request', function(done){
            const expected = new InvalidRequestError('Missing or invalid request parameter(s): [id] must be defined and non-empty');
            let req, res, next;
            req = {body:{}};
            next = function(error) {
                expectErrorToEqual(error, expected);
                done();
            }

            bookController.validateUpdate(req, res, next);
            expect(req.book).to.be.undefined;
        });

        it('is valid create request', function(done){
            let req, res, next;
            req = {body:{title:'My title'}};
            next = function(){};
            bookController.validateCreate(req, res, next);
            expect(req.book.title).to.equal('My title');
            done();
        });

        it('is valid update request', function(done){
            let req, res, next;
            req = {body:{id:'1', title:'My title'}};
            next = function(){};
            bookController.validateUpdate(req, res, next);
            expect(req.book.title).to.equal('My title');
            done();
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

        it ('gets a book specified by an id', function(done){
            // Prepare
            const expected = {};
            req.params = {id:'1'};

            // Mock
            sandbox.stub(bookService, 'getBook').callsFake(function(id){
                return Promise.resolve(expected);
            });

            // Run
            bookController.getBook(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload).to.equal(expected);
                done();
            };

            expect(bookService.getBook.calledOnce).to.equal(true);
            assert(bookService.getBook.calledWithMatch(1), 'bookService.getBook(...) should be called with id=1');
        });

        it ('error getting a book specified by an id', function(done){
            // Prepare
            const expected = new Error('An error occurred getting book where id=1.');
            req.params = {id:'1'};
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            }

            // Mock
            sandbox.stub(bookService, 'getBook').callsFake(function(){
                return Promise.reject(expected);
            });

            // Run
            bookController.getBook(req,res, next);

            // Verify
            expect(bookService.getBook.calledOnce).to.equal(true);
            assert(bookService.getBook.calledWithMatch({}));
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });


        it('finds all books', function(done){

            // Prepare
            const expected = [];

            // Mock
            sandbox.stub(bookService, 'findBooks').callsFake(function(books){
                return Promise.resolve(expected);
            });

            // Run
            bookController.findBooks(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload).to.equal(expected);
                done();
            };

            expect(bookService.findBooks.calledOnce).to.equal(true);
            assert(bookService.findBooks.calledWithMatch({}));

        });

        it('error finding all books', function(done){

            // Prepare
            const expected = new Error('An error occurred finding books.');
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            }

            // Mock
            sandbox.stub(bookService, 'findBooks').callsFake(function(){
                return Promise.reject(expected);
            });

            // Run
            bookController.findBooks(req,res, next);

            // Verify
            expect(bookService.findBooks.calledOnce).to.equal(true);
            assert(bookService.findBooks.calledWithMatch({}));
            assert(res.send.notCalled);
            assert(res.status.notCalled);

        });

        it ('create book with no author', function(done) {

            // Prepare
            const book = {_id:null, isbn:'12345', title:'My Book', authors:[]};
            req.book = book; // set by validateCreate(...)
            const expected = 3;

            // Mock
            sandbox.stub(bookService, 'createBook').callsFake(function(userId, b){
                return Promise.resolve(expected);
            });

            // Run
            bookController.createBook(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.CREATED);
                return res;
            };
            res.json = function(payload) {
                expect(payload.bookId).to.equal(expected);
                done();
            }
            expect(bookService.createBook.calledOnce).to.equal(true);
            assert(bookService.createBook.calledWithMatch(USER_ID, book), 'createBook called with book');

        });

        it ('error creating book', function(done) {

            // Prepare
            const expected = new Error('An error occurred creating book.');
            const book = {_id:null, isbn:'12345', title:'My Book', authors:[]};
            req.book = book; // set by validateCreate(...)
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            };

            // Mock
            sandbox.stub(bookService, 'createBook').callsFake(function(userId, b){
                return Promise.reject(expected);
            });

            // Run
            bookController.createBook(req,res,next);

            // Verify
            expect(bookService.createBook.calledOnce).to.equal(true);
            assert(bookService.createBook.calledWithMatch(USER_ID, book), 'createBook called with book');
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });

        it ('update book', function(done) {

            // Prepare
            const book = {_id:3, isbn:'12345', title:'Mi Book', authors:[]};
            req.book = book;
            const expected = true;

            // Mock
            sandbox.stub(bookService, 'updateBook').callsFake(function(userId, b){
                return Promise.resolve(true);
            });

            // Run
            bookController.updateBook(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload.success).to.equal(expected);
                done();
            }
            expect(bookService.updateBook.calledOnce).to.equal(true);
            assert(bookService.updateBook.calledWithMatch(USER_ID, book), 'updateBook called with book');
        });

        it ('error updating book', function(done) {

            // Prepare
            const expected = new Error('An error occurred updating book.');
            const book = {_id:3, isbn:'12345', title:'Mi Book', authors:[]};
            req.book = book;
            res.send = sinon.spy();
            res.status = sinon.spy();
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            };

            // Mock
            sandbox.stub(bookService, 'updateBook').callsFake(function(userId, b){
                return Promise.reject(expected);
            });

            // Run
            bookController.updateBook(req,res, next);

            // Verify
            expect(bookService.updateBook.calledOnce).to.equal(true);
            assert(bookService.updateBook.calledWithMatch(USER_ID, book), 'updateBook called with book');
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });

        it ('delete books', function(done){
            // Prepare
            const expected = ['1','2'];
            req.body = {ids:expected};
            next = function(err) {
                done(err);
            }
            // Mock
            sandbox.stub(bookService, 'deleteBooks').callsFake(function(ids){
                return Promise.resolve(true);
            });

            // Run
            bookController.deleteBooks(req,res, next);

            // Verify
            res.status = function(status) {
                expect(status).to.equal(HttpStatus.OK);
                return res;
            };
            res.json = function(payload) {
                expect(payload).to.be.undefined;
                done();
            }
            expect(bookService.deleteBooks.calledOnce).to.equal(true);
            //assert(bookService.deleteBooks.calledWithMatch(expected), 'deleted called with book ids');
        });

        it ('error deleting books', function(done){

            // Prepare
            const expected = new Error('An error occurred deleting book(s).');
            const booksToDelete = ['1','2'];
            res.send = sinon.spy();
            res.status = sinon.spy();
            req.body = {ids:booksToDelete};
            next = function(error) {
                expect(error).to.equal(expected);
                done();
            };

            // Mock
            sandbox.stub(bookService, 'deleteBooks').callsFake(function(ids){
                return Promise.reject(expected);
            });

            // Run
            bookController.deleteBooks(req,res, next);

            // Verify
            expect(bookService.deleteBooks.calledOnce).to.equal(true);
            assert(bookService.deleteBooks.calledWithMatch(booksToDelete), 'deleted called with book ids');
            assert(res.send.notCalled);
            assert(res.status.notCalled);
        });

    });

    describe ('Test private utility operations', function(){

        it ('toBook returns correct structure', function(done){
            const req = {body:{}};
            const KEY_COUNT = 5;
            const result = bookController.toBook(req);
            expect(Object.keys(result).length, KEY_COUNT);
            expect(result._id).to.be.null;
            expect(result.isbn).to.be.null;
            expect(result.title).to.be.null;
            assert.typeOf(result.authors, 'array');
            expect(result.authors.length).to.equal(0);
            done();
        });

        it ('converts request to book model for create request where id is not present', function(done) {
            const req = {body:{}};
            req.body = {isbn:'12345', title:'My Book', authors:[]};
            const result = bookController.toBook(req);
            expect(result._id).to.be.null;
            expect(result.isbn).to.equal('12345');
            expect(result.title).to.equal('My Book');
            expect(result.authors.length).to.equal(0);
            done();
        });

        it ('converts request to book model for update request where id is present', function(done) {
            const req = {body:{}};
            req.body = {id:'1', isbn:'12345', title:'My Book', authors:[]};
            const result = bookController.toBook(req);
            expect(result._id).to.equal(1);
            expect(result.isbn).to.equal('12345');
            expect(result.title).to.equal('My Book');
            expect(result.authors.length).to.equal(0);
            done();
        });

    });

});

function expectErrorToEqual(actual, expected) {
    expect(actual.message).to.equal(expected.message);
    expect(actual.status).to.equal(expected.status);
}