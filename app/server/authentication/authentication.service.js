/**
 * Created by rotaylor on 8/25/2017.
 */
'use strict';
const jwt = require ('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dumbledor';
const JWT_TIMEOUT = process.env.JWT_TIMEOUT || 60*10; // times out in 10 minutes by default

module.exports = {
    JWT_SECRET:JWT_SECRET,
    JWT_TIMEOUT:JWT_TIMEOUT,
    createAuthToken:createAuthToken,
    verifyAuthToken:verifyAuthToken,
    createExpiredAuthToken:createExpiredAuthToken
};



/**
 * Create the authentication token with the specified user
 * SYNCHRONOUS
 * @param user
 * @returns {{token: *}}
 */
function createAuthToken(user, timeout) {
    const options = {expiresIn: timeout || JWT_TIMEOUT};
    return jwt.sign({data:user}, JWT_SECRET, options);
}
/**
 * TESTING-ONLY
 * Create a token which has already expired
 * @param user
 * @returns {*}
 */
function createExpiredAuthToken(user){
    const timeout = (new Date()/1000) - 30; // time out 30 seconds ago
    const options = {iat: timeot};
    return jwt.sign({data:user}, JWT_SECRET, options);
}
/**
 * Validate the authentication token
 *
 * @param token
 * @returns {Promise}
 * Resolve with decoded results
 * Reject with error
 */
function verifyAuthToken(token) {

    /*
     * Example of using non-anonymous functions to
     * create and return a new Promise() instance;
     */
    function promiseCallback(resolve, reject) {

        function verifyCallback(err, decoded) {
            if (err) {
                //return res.json({ success: false, message: 'Failed to authenticate token.' });
                reject(err);
            } else {
                resolve(decoded.data);
            }
        }

        jwt.verify(token, JWT_SECRET, verifyCallback);
    }

    return new Promise(promiseCallback);
}


