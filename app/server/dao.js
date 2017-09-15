/**
 * Created by rotaylor on 8/13/2017.
 */
'use strict';
const db = require('./db.js');
module.exports = class Dao {
    constructor(collectionName, sequenceName) {
        this.collectionName = collectionName;
        this.sequenceName = sequenceName;
    }

    getCollection() {
        return db.collection(COLLECTION_NAME);
    }
}