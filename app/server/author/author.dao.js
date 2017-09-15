/**
 * Created by rotaylor on 7/7/2017.
 */


'use strict';
const db = require('../db.js');
const COLLECTION_NAME = 'authors';
const SEQUENCE_ID = 'authorId';

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
        //console.log(query);
        if (query && query.name) {
            criteria = {name: {$regex:query.name}};
        }
        try {
            getCollection().find(criteria, {sort:{name:1}})
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

function create(author) {
    const now = new Date();
    return new Promise((resolve, reject) => {
        db.next(SEQUENCE_ID).then((next)=>{
            author._id = next;
            author.created = now;
            author.updated = now;
            getCollection().insertOne(author).then((records) => {
                resolve(author);
            }).catch(reject);
        });
    });
}

function update(author) {
    return new Promise((resolve, reject) => {
        author.updated = new Date();
        getCollection().update({_id:author._id}, author).then((records) => {
            resolve(author);
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


