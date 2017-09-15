/**
 * Created by rotaylor on 7/7/2017.
 */
'use strict';
const dbClient = require('mongodb').MongoClient;
const hashUtils = require('./hashUtils');
const COUNTERS_COLLECTION = 'counters';
const BOOKS_COLLECTION = 'books';
const AUTHORS_COLLECTION = 'authors';
const USERS_COLLECTION = 'users';
const COLLECTIONS = [COUNTERS_COLLECTION, BOOKS_COLLECTION, AUTHORS_COLLECTION, USERS_COLLECTION];
const dburl = 'mongodb://localhost:27017/bookmanager';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin'; // password will be hashed before stored in db
let db;

module.exports = {
    DB_URL: process.env.MONGO_DB_URL || dburl,
    init:init,
    setup:setup,
    tearDown:tearDown,
    next:next,
    collection:collection,
    //clearCounters:clearCounters,
    close:close,
    clearAll:clearAll,
    shutDown:close,
    startUp:startUp
};


function startUp() {
    return init().then(setup);
}

/**
 * Connects to database and gets a reference
 *
 * @param dburl
 * @returns {Promise|*}
 */
function init() {
    return new Promise( (resolve, reject) => {
        try {
            dbClient.connect(dburl, (err, database)=>{
                if (err) {
                    reject(err);
                } else {
                    db = database;
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

function setup() {
    return setupCounters().then(setupUsers);
}

function setupCounters() {
    return new Promise( (resolve, reject) => {
        db.listCollections({name: COUNTERS_COLLECTION}).toArray()
            .then((items) => {
                if (items.length === 0) {
                    let collection = db.collection(COUNTERS_COLLECTION);
                    collection.insertMany([
                            {_id: 'bookId', seq: 0},
                            {_id: 'authorId', seq: 0},
                            {_id: 'userId', seq: 0}],
                        {castIds: false}).then(() => {
                            resolve();
                        });
                } else {
                    resolve();
                }
            }).catch(reject);
    });
}

function setupUsers() {
    return new Promise( (resolve, reject) => {
        db.listCollections({name: USERS_COLLECTION}).toArray()
            .then((items) => {
                if (items.length === 0) {
                    let collection = db.collection(USERS_COLLECTION);
                    next('userId').then((next)=>{
                        // Create admin user
                        return {_id:next, userName:'admin', password:null, admin:true};
                    }).then( (adminUser) =>{
                        hashUtils.hash(ADMIN_PASS).then( (hash) =>{
                            adminUser.password = hash;
                            collection.insertOne(adminUser).then((user)=>{
                                collection.createIndex({userName:1}, {unique:true});
                                resolve();
                            }).catch(reject);
                        }).catch(reject);

                    }).catch(reject);

                } else {
                    resolve();
                }
            }).catch(reject);
    });
}

function tearDown() {
    let deferred = [];
    deferred.push(dropCollection(COUNTERS_COLLECTION));
    deferred.push(dropCollection(BOOKS_COLLECTION));
    deferred.push(dropCollection(USERS_COLLECTION));
    deferred.push(dropCollection(AUTHORS_COLLECTION));
    return Promise.all(deferred);
}

function dropCollection(collectionName) {
    return new Promise((resolve, reject) => {
        db.listCollections({name:collectionName}).toArray().then((items) => {
            if (items.length > 0) {
                db.dropCollection(collectionName).then(resolve);
            } else {
                resolve();
            }
        }).catch(reject);
    })
}

function clearCounters() {
    let counters = getCounters();
    return counters.remove({});
}

function clearAll() {
    let deferred = [];
    return new Promise((resolve,reject) =>{
        COLLECTIONS.forEach((collectionName) =>{
            deferred.push(db.collection(collectionName).remove());
        });
        Promise.all(deferred).then(()=>{
            resolve();
        })
    });
}

function collection (collectionName) {
    return db.collection(collectionName);
}

function getCounters() {
    return collection(COUNTERS_COLLECTION);
}

function close() {
    if (db) {
        db.close();
    }
}

function next(sequenceName) {
    let counters = getCounters();
    return new Promise((resolve, reject) => {
        counters.findOneAndUpdate(
            { '_id' : sequenceName },
            { $inc: { 'seq' : 1 } },
            {returnOriginal: false, castIds: false}
        ).then((doc)=>{
                resolve(doc.value.seq);
            }).catch(reject);
    });

}
