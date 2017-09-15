/**
 * Created by rotaylor on 8/27/2017.
 */
    'use strict';

const SERVER_ROOT = '../../app/server';
const authController = require(SERVER_ROOT + '/authentication/authentication.controller');
const authService = require(SERVER_ROOT + '/authentication/authentication.service');
const userService = require(SERVER_ROOT + '/user/user.service');
const TEST_USER_NAME = 'Test';
const TEST_USER_PASSWORD = 'TestP';

const service = {
    getCommonHeaders:getCommonHeaders
};

module.exports = service;

function getCommonHeaders() {
    const user = {_id:1, userName:'Test', password:null};
    const token = authService.createAuthToken(user);
    const tokenHeaderName = authController.HEADER_ACCESS_TOKEN;
    let commonHeaders = {};
    commonHeaders[tokenHeaderName] = token;
    return commonHeaders;
}
