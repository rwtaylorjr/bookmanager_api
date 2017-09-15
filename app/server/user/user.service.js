/**
 * Created by rotaylor on 8/11/2017.
 */

'use strict';
const hashUtils = require('../hashUtils');
const userDao = require('./user.dao');
const UserError = require('./user-error');

module.exports = {
    login:login,
    createUser:createUser,
    changePassword:changePassword,
    findUserByUserName:findUserByUserName,
    removeUser:removeUser
};


/**
 * Login the user.
 *
 * @param user
 * @returns {Promise}
 * Resolves to the corresponding user in the database or Rejects with a
 * UserError with a code of USER_NOT_FOUND or PASSWORD_MISMATCH
 */
function login(user) {
    return new Promise((resolve, reject) => {
        userDao.findByUserName(user.userName).then( (foundUser) => {
            if (foundUser) {
                hashUtils.compare(user.password, foundUser.password).then( (result) =>{
                    if (result) {
                        foundUser.password = null;
                        resolve(foundUser);
                    } else {
                        reject(UserError.newPasswordMismatchError(user.password));
                    }

                }).catch(reject);
            } else {
                reject(UserError.newUserNotFoundError(user.userName));
            }
        }).catch(reject);
    });
}

/**
 * Create a new user
 *
 * @param user
 * @returns {Promise}
 * Resolve with user with valid _id and null password
 * Reject if an error occurs while hashing the password
 * or creating the user
 */
function createUser(user) {
    return new Promise((resolve, reject) => {
        hashUtils.hash(user.password).then( (hash) => {
            user.password = hash;
            return userDao.create(user);
        }).then((user)=>{
                user.password = null;
                resolve(user);
        }).catch(reject);
    });
}

/**
 * Change the user account password
 *
 * @param userId
 * @param oldPassword
 * @param newPassword
 * @returns {Promise}
 */
function changePassword(userId, oldPassword, newPassword) {
    return new Promise( (resolve, reject) =>{

        userDao.get(userId).then( (user) =>{

            if (user) {
                return hashUtils.compare(oldPassword, user.password);
            } else {
                throw UserError.newUserNotFoundError(userId);
            }

        }).then( (result) => {

            if (result === true) {
                userDao.update(userId, {password:newPassword}).then( (success) =>{
                    resolve(success);
                }).catch(reject);
            } else {
                reject(UserError.newPasswordMismatchError(oldPassword));
            }

        }).catch(reject);
    });


}

/**
 * Find user by the specified name
 *
 * @param userName
 * @returns {Promise}
 */
function findUserByUserName(userName) {
    return userDao.findByUserName(userName);
}

function removeUser(id) {
    return userDao.remove([id]);
}