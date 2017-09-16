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

function create(userId, author) {
    const now = new Date();
    return new Promise((resolve, reject) => {
        db.next(SEQUENCE_ID).then((next)=>{
            const doc = {
                _id:next,
                name:author.name,
                dob: author.dob,
                created: now,
                updated:now,
                createdBy:userId,
                updatedBy:userId
            }
            getCollection().insertOne(doc).then((records) => {
                resolve(doc._id);
            }).catch(reject);
        });
    });
}

function update(userId, author) {
    return new Promise((resolve, reject) => {

        const fields = {
            name:author.name,
            dob:author.dob,
            updated:new Date(),
            updatedBy:userId
        };
        const payload = {$set:fields};

        getCollection().update({_id:author._id}, payload).then((records) => {
            resolve(true);
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


