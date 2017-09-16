/**
 * Created by rotaylor on 1/22/2017.
 */
"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const SERVER_ROOT = '../../../app/server';
const db = require(SERVER_ROOT +'/db');
const utils = require(SERVER_ROOT + '/utils');
const bookDao = require(SERVER_ROOT + '/book/book.dao');
const USER_ID = 1;


describe('Book DAO Test Suite', function(){

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
        bookDao.removeAll().then(()=>{
            done();
        }).catch(done);
    });


    it('create book', (done) =>{
        let book = {title:'My Book', isbn:'1234', authors:[]};
        bookDao.create(USER_ID, book).then((id)=> {
            return bookDao.get(id);
        }).then( (book) => {
            expect(book._id).to.not.be.null;
            expect(book.title, 'book title should be My Book').to.equal('My Book');
            expect(book.isbn, 'book isbn should be 1234').to.equal('1234');
            assert.typeOf(book.authors,'array', 'book authors should be an array');
            expect(book.authors, 'book authors should be empty').to.be.empty;
            expect(book.created, 'book.created should be a date').to.be.a('date');
            expect(book.updated, 'book updated should be a date').to.be.a('date');
            expect(book.createdBy, 'book createdBy should be ' + USER_ID).to.equal(USER_ID);
            expect(book.updatedBy, 'book updatedBy should be ' + USER_ID).to.equal(USER_ID);
            done();
        }).catch(done);
    })

    it('update book', (done) =>{
        let book = {title:'My Book', isbn:'1234', authors:[]};
        bookDao.create(USER_ID, book).then((id)=> {
            book._id = id;
            return bookDao.get(id);
        }).then( (result) =>{
            result.title = 'My Books';
            return bookDao.update(USER_ID, result);
        }).then((result)=>{
            return bookDao.get(book._id);
        }).then((result) =>{
            expect(result._id).to.not.be.null;
            expect(result.title, 'book title should be My Books').to.equal('My Books');
            expect(result.isbn, 'book isbn should be 1234').to.equal('1234');
            assert.typeOf(result.authors,'array', 'book authors should be an array');
            expect(result.authors, 'book authors should be empty').to.be.empty;
            expect(result.created, 'book.created should be a date').to.be.a('date');
            expect(result.updated, 'book updated should be a date').to.be.a('date');
            expect(result.createdBy, 'book createdBy should be ' + USER_ID).to.equal(USER_ID);
            expect(result.updatedBy, 'book updatedBy should be ' + USER_ID).to.equal(USER_ID);
            expect(result.created).to.not.eql(result.updated);
            done();
        }).catch(done);
    });

    it('get book', (done) =>{
        let book = {title:'My Book', isbn:'1234', authors:[]};
        bookDao.create(USER_ID, book).then((id)=> {
            return bookDao.get(id);
        }).then((result)=>{
            expect(result._id).to.not.be.null;
            expect(result.title, 'book title should be My Books').to.equal('My Book');
            expect(result.isbn, 'book isbn should be 1234').to.equal('1234');
            assert.typeOf(result.authors,'array', 'book authors should be an array');
            expect(result.authors, 'book authors should be empty').to.be.empty;
            expect(result.created, 'book.created should be a date').to.be.a('date');
            expect(result.updated, 'book updated should be a date').to.be.a('date');
            expect(result.createdBy, 'book createdBy should be ' + USER_ID).to.equal(USER_ID);
            expect(result.updatedBy, 'book updatedBy should be ' + USER_ID).to.equal(USER_ID);
            done();
        }).catch(done);
    })

    it('find book like title', (done) =>{
        let newBooks = [
            {title:'ABook', isbn:'1234', authors:[]},
            {title:'ANovel', isbn:'1235', authors:[]},
            {title:'BShort', isbn:'1236', authors:[]},
            {title:'CShorts', isbn:'1237', authors:[]}
        ];
        let deferred = [];
        newBooks.forEach((b) => {
            deferred.push(bookDao.create(USER_ID, b));
        });

        Promise.all(deferred).then(() => {
            return bookDao.find({title: 'Short'});
        }).then((results) => {
            expect(results.length).to.equal(2);
            expect(results[0].title).to.equal('BShort');
            done();
        }).catch(done);

    })

    it('find book with authors', (done) =>{
        let newBooks = [
            {title:'ABook', isbn:'1234', authors:[1]},
            {title:'ANovel', isbn:'1235', authors:[1,2]},
            {title:'BShort', isbn:'1236', authors:[2,3]},
            {title:'CShorts', isbn:'1237', authors:[4]}
        ];
        let deferred = [];
        newBooks.forEach((b) => {
            deferred.push(bookDao.create(USER_ID, b));
        });

        Promise.all(deferred).then(() => {
            return bookDao.find({authors: [1,2]});
        }).then((results) => {
            expect(results.length).to.equal(3);
            expect(results[0].title).to.equal('ABook');
            done();
        }).catch(done);

    })

    it('finds all books', (done) =>{
        const newBooks = [
            {title:'ABook', isbn:'1234', authors:[]},
            {title:'ANovel', isbn:'1235', authors:[]},
            {title:'BShort', isbn:'1236', authors:[]},
            {title:'CShorts', isbn:'1237', authors:[]}
        ];
        const deferred = [];
        newBooks.forEach((b) => {
            deferred.push(bookDao.create(USER_ID, b));
        });

        Promise.all(deferred).then(() => {
            return bookDao.find();
        }).then((results) => {
            expect(results.length).to.equal(4);
            expectBooksToBeEqual(results[0], newBooks[0]);
            expectBooksToBeEqual(results[1], newBooks[1]);
            expectBooksToBeEqual(results[2], newBooks[2]);
            expectBooksToBeEqual(results[3], newBooks[3]);
            done();
        }).catch(done);

    })



});

function expectBooksToBeEqual(actualBook, expectedBook) {
    expect(utils.isValidSequenceId(actualBook._id)).to.be.true;
    expect(actualBook.title).to.equal(expectedBook.title);
    expect(actualBook.isbn).to.equal(expectedBook.isbn);
    expect(actualBook.authors).to.eql(expectedBook.authors);
    expect(actualBook.created).to.be.a('date');
    expect(actualBook.updated).to.be.a('date');
}