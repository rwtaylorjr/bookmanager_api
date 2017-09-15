/**
 * Created by rotaylor on 8/13/2017.
 */
    'use strict';

const bcrypt = require('bcrypt-nodejs');

module.exports = {
    hash:hash,
    compare:compare,
    hashSync:hashSync
};

function hash(unhashed) {
    return new Promise( (resolve, reject) => {
        bcrypt.hash(unhashed, null, null, function(err, hash) {
            if (err) {
                reject(err);
            } else {
              resolve(hash);
            }
        });
    });
}

function compare(unhashed, hashed) {
    return new Promise( (resolve, reject) =>{
        bcrypt.compare(unhashed, hashed, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

function hashSync(data) {
    return bcrypt.hashSync(data);
}