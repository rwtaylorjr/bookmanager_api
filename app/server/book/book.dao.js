/**
 * Created by rotaylor on 7/7/2017.
 */


'use strict';
const db = require('../db.js');
const COLLECTION_NAME = 'books';
const SEQUENCE_ID = 'bookId';

module.exports = {
    find:find,
    get:get,
    create:create,
    update:update,
    remove:remove,
    removeAll:removeAll
};


function find(query) {

    return new Promise((resolve, reject) => {
        let criteria = {};
        let params = {sort:{title:1}};

        if (query) {

            if (query.title) {
                criteria = {title: {$regex:query.title}};
            }

            if (query.authors && Array.isArray(query.authors) && query.authors.length > 0) {
                criteria = {authors: {$in:query.authors}};
            }
        }

        try {
            getCollection().find(criteria, params)
                .toArray().then((documents) => {
                    resolve(documents);
                }).catch(reject);
        } catch (e) {
            reject(e);
        }


    });
}

function get(id) {
    return getCollection().findOne({_id:id});
}

function create(book) {
    const now = new Date();
    return new Promise((resolve, reject) => {
        db.next(SEQUENCE_ID).then((next)=>{
            book._id = next;
            book.created = now;
            book.updated = now;
            getCollection().insertOne(book).then((records) => {
                resolve(book);
            }).catch(reject);
        });
    });
}

function update(book) {
    return new Promise((resolve, reject) => {
        book.updated = new Date();
        getCollection().update({_id:book._id}, book).then((records) => {
            resolve(book);
        }).catch(reject);
    });
}

function remove(ids) {
    let deferred = [];
    ids.forEach((id)=>{
        deferred.push(getCollection().remove({_id:id}));
    });
    return Promise.all(deferred);

}

function removeAll() {
    return getCollection().remove();
}

function getCollection() {
    return db.collection(COLLECTION_NAME);
}


