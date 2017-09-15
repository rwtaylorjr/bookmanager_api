/**
 * Created by rotaylor on 1/22/2017.
 */
"use strict";

const chai = require('chai');

const SERVER_ROOT = '../../../app/server';
const db = require(SERVER_ROOT +'/db');
const utils = require(SERVER_ROOT + '/utils');
const authorDao = require(SERVER_ROOT + '/author/author.dao');

const assert = chai.assert;
const expect = chai.expect;

describe('Author DAO Test Suite', function(){

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
        authorDao.removeAll().then(()=>{
            done();
        }).catch(done);
    });


    it('create author', (done) =>{
        const expected = newAuthor();
        authorDao.create(expected).then((actual)=> {
            expect(actual._id).to.not.be.null;
            expect(actual.name, 'author title should be My Author').to.equal(expected.name);
            expect(actual.dob, 'author dob should be 11/1/1999').to.eql(expected.dob);
            expect(actual.created, 'author.created should be defined').to.not.be.undefined;
            expect(actual.created, 'author.created should not be null').to.not.be.null;
            expect(actual.updated, 'author.updated should be defined').to.not.be.undefined;
            expect(actual.updated, 'author.updated should not be null').to.not.be.null;
            done();
        }).catch(done);
    })

    it('update author', (done) =>{
        const expected = newAuthor();
        const expectedName = 'Mi Author';
        authorDao.create(expected).then((created)=> {
            created.name = expectedName;
            return authorDao.update(created);
        }).then((result)=>{
            return authorDao.get(expected._id);
        }).then((actual) =>{
            expect(actual._id).to.not.be.null;
            expect(actual.name, 'author name should be Mi Author').to.equal(expectedName);
            expect(actual.dob, 'author dob should be 11/1/1999').to.eql(expected.dob);
            expect(actual.created, 'author.created should be defined').to.not.be.undefined;
            expect(actual.created, 'author.created should not be null').to.not.be.null;
            expect(actual.updated, 'author.updated should be defined').to.not.be.undefined;
            expect(actual.updated, 'author.updated should not be null').to.not.be.null;
            done();
        }).catch(done);
    });

    it('get author', (done) =>{
        const expected = newAuthor();
        authorDao.create(expected).then((created)=> {
            return authorDao.get(created._id);
        }).then((actual)=>{
            expect(actual._id).to.not.be.null;
            expect(actual.name, 'author name should be My Author').to.equal(expected.name);
            expect(actual.dob, 'author dob should be 11/1/1999').to.eql(expected.dob);
            expect(actual.created, 'author.created should be defined').to.not.be.undefined;
            expect(actual.created, 'author.created should not be null').to.not.be.null;
            expect(actual.updated, 'author.updated should be defined').to.not.be.undefined;
            expect(actual.updated, 'author.updated should not be null').to.not.be.null;
            done();
        }).catch(done);
    })

    it('find author like name', (done) =>{
        let newAuthors = [
            {name:'AAuthor', dob: new Date(1999, 11, 1)},
            {name:'ANovel', dob: new Date(1999, 11, 2)},
            {name:'BShort', dob: new Date(1999, 11, 3)},
            {name:'CShorts', dob: new Date(1999, 11, 4)}
        ];
        let deferred = [];
        newAuthors.forEach((b) => {
            deferred.push(authorDao.create(b));
        });

        Promise.all(deferred).then(() => {
            return authorDao.find({name: 'Short'});
        }).then((results) => {
            expect(results.length).to.equal(2);
            expect(results[0].name).to.equal('BShort');
            done();
        }).catch(done);

    })

    it('finds all authors', (done) =>{
        let newAuthors = [
            {name:'AAuthor', dob: new Date(1999, 11, 1)},
            {name:'ANovel', dob: new Date(1999, 11, 2)},
            {name:'BShort', dob: new Date(1999, 11, 3)},
            {name:'CShorts', dob: new Date(1999, 11, 4)}
        ];
        let deferred = [];
        newAuthors.forEach((b) => {
            deferred.push(authorDao.create(b));
        });

        Promise.all(deferred).then(() => {
            return authorDao.find();
        }).then((results) => {
            expect(results.length).to.equal(4);
            expectAuthorsToBeEqual(newAuthors[0], results[0]);
            expectAuthorsToBeEqual(newAuthors[1], results[1]);
            expectAuthorsToBeEqual(newAuthors[2], results[2]);
            expectAuthorsToBeEqual(newAuthors[3], results[3]);
            done();
        }).catch(done);

    })



});

function expectAuthorsToBeEqual(actualAuthor, expectedAuthor) {
    expect(utils.isValidSequenceId(actualAuthor._id)).to.be.true;
    expect(actualAuthor.name).to.equal(expectedAuthor.name);
    expect(actualAuthor.dob.toISOString()).to.eql(expectedAuthor.dob.toISOString());
    expect(actualAuthor.created).to.eql(expectedAuthor.created);
    expect(actualAuthor.updated).to.eql(expectedAuthor.updated);
}

function newAuthor() {
    const dob = new Date(1999, 11, 1);
    let author = {name:'My Author', dob:dob};
    return author;
}