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
const authorService = require(SERVER_ROOT +'/author/author.service');
const bookService = require(SERVER_ROOT + '/book/book.service');
const api = '/api/authors';
const app = server.init();
const commonHeaders = testUtils.getCommonHeaders();
const TEST_DOB_STRING = '12-12-1999';
const TEST_DOB = utils.parseDate(TEST_DOB_STRING);
const authors = [
    {name:'AAuthor', dob:utils.parseDate('12-11-1999')},
    {name:'ANovel', dob:utils.parseDate('12-12-1999')},
    {name:'BShort', dob:utils.parseDate('12-13-1999')},
    {name:'CShorts', dob:utils.parseDate('12-14-1999')}
];
const USER_ID = 1;
describe('Author Controller API Tests', function(){

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

    describe('GET /authors ', (done) => {
        beforeEach((done) => {
            let deferred = [];
            authors.forEach((b) => {
                deferred.push(authorService.createAuthor(USER_ID, b));
            });
            Promise.all(deferred).then(()=>{
                done();
            }).catch(done);
        });

        afterEach( (done) => {
            authorService.deleteAllAuthors().then( ()=>{
                done();
            });
        })

        it('should find all authors', function(done) {
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
                        expectAuthorsToBeEqual(res.body[0], authors[0]);
                        expectAuthorsToBeEqual(res.body[1], authors[1]);
                        expectAuthorsToBeEqual(res.body[2], authors[2]);
                        expectAuthorsToBeEqual(res.body[3], authors[3]);
                        done();
                    }

                });
        });

        it('should find authors like...', (done) =>{
            request(app)
                .get(api)
                .set(commonHeaders)
                .query({name:'Short'})
                .expect(HttpStatus.OK)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.body.length).to.equal(2);
                        expectAuthorsToBeEqual(res.body[0], authors[2]);
                        expectAuthorsToBeEqual(res.body[1], authors[3]);
                        done();
                    }

                });

        });

        it('should get a specific author', (done) =>{
            const author = {name:'ZAuthor', dob:TEST_DOB};
            authorService.createAuthor(USER_ID, author).then( (id) => {
                request(app)
                    .get(api + '/' + id)
                    .set(commonHeaders)
                    .expect(HttpStatus.OK)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        } else {
                            expectAuthorsToBeEqual(res.body, author);
                            done();
                        }

                    });
            });

        });
    });

    describe('POST /authors', (done) => {

        after( (done) => {
            authorService.deleteAllAuthors().then( ()=>{
                done();
            });
        })

        it('failed to create a new author due to missing name', (done) =>{
            let input = {dob:TEST_DOB_STRING};
            request(app)
                .post(api)
                .set(commonHeaders)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);

        });

        it('failed to create a new author due to empty name', (done) =>{
            let input = {name:'', dob:TEST_DOB_STRING};
            request(app)
                .post(api)
                .set(commonHeaders)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);

        });

        it('failed to create a new author due to missing dob', (done) =>{
            let input = {name:'Author'};
            request(app)
                .post(api)
                .set(commonHeaders)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);

        });

        it('failed to create a new author due to empty dob', (done) =>{
            let input = {name:'Author', dob:null};
            request(app)
                .post(api)
                .set(commonHeaders)
                .send(input)
                .expect(HttpStatus.BAD_REQUEST)
                .expect('Content-Type', /json/)
                .end(done);

        });

        it('create a new author', (done) =>{
            let input = {name:'My Title', dob:TEST_DOB_STRING};
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
                        expect(utils.isValidSequenceId(res.body.authorId)).to.be.true;
                        done();
                    }
                });

        });
    });

    describe('PUT /authors/:id', (done) => {

        after( (done) => {
            authorService.deleteAllAuthors().then( ()=>{
                done();
            });
        })

        it('failed to updated a author due to missing id', (done) =>{
            let author = {name:'ZAuthor', dob:TEST_DOB_STRING};
            authorService.createAuthor(USER_ID, author).then( (b) => {
                const input = {name:'ZAuthors', dob:b.dob};
                request(app)
                    .put(api + '/' + b._id)
                    .set(commonHeaders)
                    .send(input)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect('Content-Type', /json/)
                    .end(done);
            });
        });

        it('failed to updated a author due to empty id', (done) =>{
            let author = {name:'ZAuthor', dob:TEST_DOB_STRING};
            authorService.createAuthor(USER_ID, author).then( (b) => {
                const input = {_id:'', name:'ZAuthors', dob:b.dob};
                request(app)
                    .put(api + '/' + b._id)
                    .set(commonHeaders)
                    .send(input)
                    .expect(HttpStatus.BAD_REQUEST)
                    .expect('Content-Type', /json/)
                    .end(done);
            });
        });

        it('successfully updated a author', (done) =>{
            let author = {name:'ZAuthor', dob:TEST_DOB_STRING};
            authorService.createAuthor(USER_ID, author).then( (id) => {
                return authorService.getAuthor(id).then( (author) =>{
                    const input = {id:author._id, name:'ZAuthors', dob:author.dob};
                    request(app)
                        .put(api + '/' + id)
                        .set(commonHeaders)
                        .send(input)
                        .expect(HttpStatus.OK)
                        .expect('Content-Type', /json/)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            } else {
                                expect(res.body.success, 'expect success to be true').to.be.true;
                                done();
                            }

                        });
                });

            });
        });
    });

    describe('DELETE /authors', (done) => {

        afterEach( (done) => {

            authorService.deleteAllAuthors().then( ()=>{
                done();
            });
        })

        it('deletes authors', (done) =>{
            let deferred = [];
            authors.forEach((b) => {
                deferred.push(authorService.createAuthor(USER_ID, b));
            });
            Promise.all(deferred)
                .then(authorService.findAuthors)
                .then((authors)=>{
                    let ids = [];
                    authors.forEach((author) =>{
                        ids.push(author._id);
                    });
                    const input = {ids:ids};
                    request(app)
                        .delete(api)
                        .set(commonHeaders)
                        .send(input)
                        .expect(HttpStatus.OK)
                        .expect('Content-Type', /json/)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            } else {
                                authorService.findAuthors().then((authors) =>{
                                    expect(authors.length).to.equal(0);
                                    done();
                                }).catch(done);
                            }

                        });
                }).catch(done);
        });

        it('deletes authors with no ids provided', (done) =>{
            let deferred = [];
            authors.forEach((b) => {
                deferred.push(authorService.createAuthor(USER_ID, b));
            });
            Promise.all(deferred)
                .then(authorService.findAuthors)
                .then((authors)=>{
                    let ids = [];
                    const input = {ids:ids};
                    request(app)
                        .delete(api)
                        .set(commonHeaders)
                        .send(input)
                        .expect(HttpStatus.OK)
                        .expect('Content-Type', /json/)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            } else {
                                authorService.findAuthors().then((authors) =>{
                                    expect(authors.length).to.equal(4);
                                    done();
                                }).catch(done);
                            }
                        });
                }).catch(done);
        });

        it('deletes authors with at least one invalid id', (done) =>{
            let deferred = [];
            authors.forEach((b) => {
                deferred.push(authorService.createAuthor(USER_ID, b));
            });
            Promise.all(deferred)
                .then(authorService.findAuthors)
                .then((authors)=>{
                    let ids = [1,2,3,'y'];
                    const input = {ids:ids};
                    request(app)
                        .delete(api)
                        .set(commonHeaders)
                        .send(input)
                        .expect(HttpStatus.BAD_REQUEST)
                        .expect('Content-Type', /json/)
                        .end(function(err, res) {
                            if (err) {
                                return done(err);
                            } else {
                                authorService.findAuthors().then((authors) =>{
                                    expect(authors.length).to.equal(4);
                                    done();
                                }).catch(done);
                            }

                        });
                }).catch(done);
        });

        it('fails to delete author referenced by book', (done) => {
            let authorId;
            authorService.createAuthor(USER_ID, {name: 'Author', dob: TEST_DOB}).then((id) => {
                authorId = id;
                return authorService.getAuthor(id);
            }).then((author) => {
                return bookService.createBook(USER_ID, {title: 'Book', isbn: '1234', authors: [author._id]});
            }).then((id) => {
                const ids = [authorId];
                const input = {ids: ids};
                request(app)
                    .delete(api)
                    .set(commonHeaders)
                    .send(input)
                    .expect(HttpStatus.METHOD_NOT_ALLOWED)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        } else {
                            authorService.findAuthors().then((authors) => {
                                expect(authors.length).to.equal(1);
                                expect(res.body.length).to.equal(1);
                                expect(res.body[0].title).to.equal('Book');
                                expect(res.body[0].isbn).to.equal('1234');
                                expect(res.body[0].authors.length).to.equal(1);
                                expect(res.body[0].authors[0]).to.equal(authorId);
                                done();
                            }).catch(done);
                        }
                    });
            }).catch(done);
        });
    });





});

function expectAuthorsToBeEqual(actualAuthor, expectedAuthor) {
    expect(actualAuthor._id).to.not.be.null;
    expect(actualAuthor.name).to.equal(expectedAuthor.name);
    expect(actualAuthor.dob).to.eql(expectedAuthor.dob.toISOString());
    expect(actualAuthor.created).to.not.be.a('date');
    expect(actualAuthor.updated).to.not.be.a('date');
    expect(actualAuthor.createdBy).to.equal(USER_ID);
    expect(actualAuthor.updatedBy).to.equal(USER_ID);
}