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
const bookService = require(SERVER_ROOT +'/book/book.service');
const api = '/api/books';
const app = server.init();
const commonHeaders = testUtils.getCommonHeaders();
const USER_ID = 1;

describe('Book Controller API Tests', function(){

    before( (done) => {
        db.init()
            .then(db.setup)
            .then(()=>{
                done();
            })
            .catch ( (err) =>{
            db.close();
            done(err);
        })
    });

    after((done) => {
        db.tearDown().then(db.close).then(done).catch(done);
    });

    describe('GET /books ', (done) => {
        var books;
        beforeEach((done) => {
            books = [
                {title:'ABook', isbn:'1234', authors:[]},
                {title:'ANovel', isbn:'1235', authors:[]},
                {title:'BShort', isbn:'1236', authors:[]},
                {title:'CShorts', isbn:'1237', authors:[]}
            ];
            let deferred = [];
            books.forEach((b) => {
                deferred.push(bookService.createBook(USER_ID, b));
            });
            Promise.all(deferred).then(()=>{
                done();
            }).catch(done);
        });

        afterEach( (done) => {
            bookService.deleteAllBooks().then( ()=>{
                done();
            });
        })

        it('should find all books', function(done) {
            request(app)
                .get(api)
                .set(commonHeaders)
                .expect(HttpStatus.OK)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    } else {
                        expect(res.body.length).to.equal(4);
                        expectBooksToBeEqual(res.body[0], books[0]);
                        expectBooksToBeEqual(res.body[1], books[1]);
                        expectBooksToBeEqual(res.body[2], books[2]);
                        expectBooksToBeEqual(res.body[3], books[3]);
                        done();
                    }

                });
        });

        it('should find books like...', (done) =>{
            request(app)
                .get(api)
                .set(commonHeaders)
                .query({title:'Short'})
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.body.length).to.equal(2);
                        expectBooksToBeEqual(res.body[0], books[2]);
                        expectBooksToBeEqual(res.body[1], books[3]);
                        done();
                    }

                });

        });

        it('should get a specific book', (done) =>{
            let book = {title:'ZBook', isbn:'1230', authors:[]};
            bookService.createBook(USER_ID, book).then( (id) => {
                request(app)
                    .get(api + '/' + id)
                    .set(commonHeaders)
                    .expect(HttpStatus.OK)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        } else {
                            expect(res.body._id).to.equal(id);
                            done();
                        }

                    });
            });

        });
    });

    describe('POST /books', (done) => {

        after( (done) => {
            bookService.deleteAllBooks().then( ()=>{
                done();
            });
        })

        it('failed to create a new book due to missing title', (done) =>{
            let input = {isbn: '88888', authors:[]};
            request(app)
                .post(api)
                .set(commonHeaders)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);

        });

        it('failed to create a new book due to empty title', (done) =>{
            let input = {title:'', isbn: '88888', authors:[]};
            request(app)
                .post(api)
                .set(commonHeaders)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);

        });

        it('create a new book', (done) =>{
            let input = {title:'My Title', isbn: '88888', authors:[]};
            request(app)
                .post(api)
                .set(commonHeaders)
                .send(input)
                .expect(HttpStatus.CREATED)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        expect(utils.isValidSequenceId(res.body.bookId)).to.be.true;
                        done();
                    }
                });

        });
    });

    describe('PUT /books/:id', (done) => {

        after( (done) => {
            bookService.deleteAllBooks().then( ()=>{
                done();
            });
        })

        it('failed to updated a book due to missing id', (done) =>{
            let book = {title:'ZBook', isbn:'1230', authors:[]};
            bookService.createBook(USER_ID, book).then( (id) => {
                return bookService.getBook(id);
            }).then( (b) => {
                const input = {title:'ZBooks', isbn:b.isbn, authors:b.authors};
                request(app)
                    .put(api + '/' + b._id)
                    .set(commonHeaders)
                    .send(input)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect('Content-Type', /json/)
                    .end(done);
            }).catch(done);
        });

        it('failed to updated a book due to empty id', (done) =>{
            let book = {title:'ZBook', isbn:'1230', authors:[]};
            bookService.createBook(USER_ID, book).then( (id) => {
                return bookService.getBook(id);
            }).then( (b) => {
                const input = {_id:'', title:'ZBooks', isbn:b.isbn, authors:b.authors};
                request(app)
                    .put(api + '/' + b._id)
                    .set(commonHeaders)
                    .send(input)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect('Content-Type', /json/)
                    .end(done);
            });
        });

        it('successfully updated a book', (done) =>{
            let book = {title:'ZBook', isbn:'1230', authors:[]};
            bookService.createBook(USER_ID, book).then( (id) => {
                return bookService.getBook(id);
            }).then( (b) => {
                const input = {id:b._id, title:'ZBooks', isbn:b.isbn, authors:b.authors};
                request(app)
                    .put(api + '/' + b._id)
                    .set(commonHeaders)
                    .send(input)
                    .expect(HttpStatus.OK)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        } else {
                            expect(res.body.success, 'expect success to equal true').to.be.true;
                            done();
                        }

                    });
            });
        });
    });

    describe('DELETE /books', (done) => {

        afterEach( (done) => {
            bookService.deleteAllBooks().then( ()=>{
                done();
            });
        })

        it ('deletes books', (done) =>{
            createBooksToDelete()
                .then(bookService.findBooks)
                .then((books)=>{
                    let ids = [];
                    books.forEach((book) =>{
                        ids.push(book._id);
                    });
                    const input = {ids:ids};
                    request(app)
                        .delete(api)
                        .set(commonHeaders)
                        .send(input)
                        .expect('Content-Type', /json/)
                        .expect(HttpStatus.OK)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            } else {
                                bookService.findBooks().then((books) =>{
                                    expect(books.length).to.equal(0);
                                    done();
                                }).catch(done);
                            }

                        });
                }).catch(done);
        });

        it ('deletes books with no ids provided', (done) =>{
            createBooksToDelete()
                .then(bookService.findBooks)
                .then((books)=>{
                    let ids = [];
                    const input = {ids:ids};
                    request(app)
                        .delete(api)
                        .set(commonHeaders)
                        .send(input)
                        .expect('Content-Type', /json/)
                        .expect(HttpStatus.OK)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            } else {
                                bookService.findBooks().then((books) =>{
                                    expect(books.length).to.equal(4);
                                    done();
                                }).catch(done);
                            }
                        });
                }).catch(done);
        });

        it ('deletes books with at least one invalid id', (done) =>{
            createBooksToDelete()
                .then(bookService.findBooks)
                .then((books)=>{
                    let ids = [1,2,3,'y'];
                    const input = {ids:ids};
                    request(app)
                        .delete(api)
                        .set(commonHeaders)
                        .send(input)
                        .expect('Content-Type', /json/)
                        .expect(HttpStatus.BAD_REQUEST)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            } else {
                                bookService.findBooks().then((books) =>{
                                    expect(books.length).to.equal(4);
                                    done();
                                }).catch(done);
                            }

                        });
                }).catch(done);
        });

    });





});

function expectBooksToBeEqual(actualBook, expectedBook) {
    expect(utils.isValidSequenceId(actualBook._id)).to.be.true;
    expect(actualBook.title).to.equal(expectedBook.title);
    expect(actualBook.isbn).to.equal(expectedBook.isbn);
    expect(actualBook.authors).to.eql(expectedBook.authors);
    expect(actualBook.created).to.equal(actualBook.updated);
}

function createBooksToDelete() {
        const books = [
            {title:'ABook', isbn:'1234', authors:[]},
            {title:'ANovel', isbn:'1235', authors:[]},
            {title:'BShort', isbn:'1236', authors:[]},
            {title:'CShorts', isbn:'1237', authors:[]}
        ];
        let deferred = [];
        books.forEach((b) => {
            deferred.push(bookService.createBook(USER_ID, b));
        });
        return Promise.all(deferred);

}