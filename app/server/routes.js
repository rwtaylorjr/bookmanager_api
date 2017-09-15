/**
 * Created by rotaylor on 1/15/2017.
 */
'use strict';
const HttpStatus = require('http-status-codes');
const bookRoutes = require('./book/routes');
const authorRoutes = require('./author/routes');
const userRoutes = require('./user/routes');
const baseUri = '/api';

module.exports = function(app) {
    app.use(baseUri, bookRoutes);
    app.use(baseUri, authorRoutes);
    app.use(baseUri, userRoutes);
    //app.use(baseUri, unprotectedRoutes);


}

