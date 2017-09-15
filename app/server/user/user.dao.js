/**
 * Created by rotaylor on 8/11/2017.
 */
'use strict';

const db = require('../db.js');
const COLLECTION_NAME = 'users';
const SEQUENCE_ID = 'userId';

module.exports = {
    get:get,
    create:create,
    update:update,
    find:find,
    findByUserName:findByUserName,
    remove:remove,
    removeAll:removeAll

};

/**
 * Get user by the user id.
 * Resolves the either a user or undefined if one cannot be found.
 *
 * @param id
 * @returns {Promise}
 */
function get(id) {
    let query = {_id:id};
    return new Promise((resolve, reject) => {
        find(query).then( (users) =>{
            if (users && users.length > 0) {
                resolve(users[0]);
            } else {
                resolve(undefined);
            }

        }).catch(reject);
    });

}

/**
 * Create a new user.
 * Resolves to the created user with the newly added _id value.
 *
 * @param user
 * @returns {Promise}
 */
function create(user) {
    return new Promise((resolve, reject) => {
        db.next(SEQUENCE_ID).then((next)=>{
            user._id = next;
            user.admin = false;
            getCollection().insertOne(user).then((records) => {
                resolve(user);
            }).catch(reject);
        });
    });
}

/**
 * Updates the user.
 * Resolves to the same user.
 *
 * @param userId
 * @param updatePayload
 * @returns {Promise}
 */
function update(userId, updatePayload) {
    const params = {$set:updatePayload};
    return new Promise((resolve, reject) => {
        getCollection().update({_id:userId}, params).then((updateResult) => {
            const result = updateResult.result;
            //console.log('update result', result);
            if (result.n === 1 && result.nModified === 1 && result.ok === 1) {
                resolve(true);
            } else {
                reject(false);
            }

        }).catch(reject);
    });

}

/**
 * Find users with the specified query.
 *
 * @param query
 * @returns {Promise}
 */
function find(query) {
    return new Promise((resolve, reject) => {
        let results = [];
        let criteria = {};
        //console.log(query);
        if (query) {
            if (query.userName) {
                criteria.userName = {$regex:query.userName};
            }
            if (query._id) {
                criteria._id = query._id;
            }
        }

        try {
            getCollection().find(criteria, {sort:{userName:1}})
                .toArray().then((documents) => {
                    resolve(documents);
                }).catch(reject);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Find user by the specified user name
 * @param userName
 * @returns {Promise}
 */
function findByUserName(userName) {
    return new Promise( (resolve, reject) => {
        let criteria = {userName:userName};
        find(criteria).then( (users) => {
            if (users) {
                resolve(users[0]);
            } else {
                resolve(undefined);
            }

        }).catch(reject);
    });
}

function remove(ids) {
    let deferred = [];
    if (Array.isArray(ids)) {
        ids.forEach((id)=>{
            deferred.push(getCollection().remove({_id:id}));
        });
    } else if (Number.isInteger(ids)) {
        deferred.push(getCollection().remove({_id:ids}));
    }

    return Promise.all(deferred);

}

function removeAll() {
    return getCollection().remove();
}

function getCollection() {
    return db.collection(COLLECTION_NAME);
}
