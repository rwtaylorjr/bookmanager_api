/**
 * Created by rotaylor on 1/15/2017.
 * Revealing Module Pattern
 */

'use strict';

const bookService = require('./book.service');
const utils = require('../utils');
const HttpStatus = require('http-status-codes');
const InvalidRequestError = require('../errors/invalid-request-error');

module.exports = {
    findBooks:findBooks,
    getBook:getBook,
    createBook:createBook,
    updateBook:updateBook,
    deleteBooks:deleteBooks,
    validateCreate:validateCreate,
    validateUpdate:validateUpdate,
    validateDelete:validateDelete,
    toBook:toBook,
    //newParamValidationError:newParamValidationError,
    buildQuery:buildQuery
};


/**
 * Find books with the specified query parameters
 * in the request.
 *
 * @param req
 * @param res
 * @param next
 */
function findBooks(req, res, next) {
    const query = buildQuery(req);
    bookService.findBooks(query)
        .then(function(books){
            res.status(HttpStatus.OK).json(books);
        }).catch((err) => {
            //console.log(err);
            next(err);
        });
}

/**
 * Get the book corresponding to req.param.id
 * Assert that the req.param.id will be a valid sequence id
 *
 * @param req
 * @param res
 * @param next
 */
function getBook(req, res, next) {
    const id = parseInt(req.params.id);
    bookService.getBook(id)
        .then(function(book){
            res.status(HttpStatus.OK).json(book); // default status: 200
        }).catch(next);
}

/**
 * Create a new book with the specified book information
 * in the request body.
 *
 * @param req
 * @param res
 * @param next
 */
function createBook(req, res, next) {
    const book = req.book;
    const userId = req.user._id;
    bookService.createBook(userId, book)
        .then(function(id){
            const payload = {bookId: id};
            res.status(HttpStatus.CREATED).json(payload); // with id populated
        }).catch(next);
}

/**
 * Update the book with the specified book information
 * in the request body
 *
 * @param req
 * @param res
 * @param next
 */
function updateBook(req, res, next) {
    const book = req.book;
    const userId = req.user._id;
    bookService.updateBook(userId, book)
        .then(function(b){
            const payload = {success:true};
            res.status(HttpStatus.OK).json(payload);
        }).catch(next);
}

/**
 * Delete the books corresponding to the book ids
 * in the request body.
 *
 * @param req
 * @param res
 * @param next
 */
function deleteBooks(req, res, next) {
    let ids = req.body.ids;
    if (ids && ids.length > 0) {
        bookService.deleteBooks(ids)
            .then(() => {
                res.status(HttpStatus.OK).json(); // deleted books
            }).catch(next);
    } else {
        res.status(HttpStatus.OK).json();
    }

}

/**
 * Validate the create request.
 * If invalid, set error in next, otherwise
 * parse request into book and set it on the request to be used
 * down stream by the create handler
 *
 * @param req
 * @param res
 * @param next
 */
function validateCreate(req, res, next) {
    const payload = req.body;
    if (!payload.title) {
        next(InvalidRequestError.newParamValidationError('title'));
    } else {
        req.book = toBook(req);
        next();
    }
}

/**
 * Validate the update request.
 * If invalid, set error in next, otherwise
 * parse request into book and set it on the request to be used
 * down stream by the update handler
 *
 * @param req
 * @param res
 * @param next
 */
function validateUpdate(req, res, next) {
    const payload = req.body;
    if (!payload.id) {
        next(InvalidRequestError.newParamValidationError('id'));
    } else if (!payload.title) {
        next(InvalidRequestError.newParamValidationError('title'));
    } else {
        req.book = toBook(req);
        next();
    }
}

/**
 * Validate delete request.
 *
 * If invalid, set error in next, otherwise
 * parse request into book and set it on the request to be used
 * down stream by the delete handler
 *
 * @param req
 * @param res
 * @param next
 */
function validateDelete(req, res, next) {
    const payload = req.body;
    if (payload.ids && payload.ids.length > 0) {
        if(payload.ids.every(utils.isValidSequenceId)) {
            next();
        } else {
            next(InvalidRequestError.newParamValidationError('ids'));
        }

    } else {
        next();
    }
}

/**
 * Transform the req body information into a book model.
 *
 * @param req
 * @returns {{_id: (number|null), isbn: (string|null), title: (string|string|null), authors: Array}}
 */
function toBook(req) {
    // TODO: Look into use Object.assign(...)
    let body = req.body;
    const id = parseInt(body.id) || null;
    const title = body.title || null;
    const isbn = body.isbn || null;
    const authors = body.authors || [];
    const book = {_id:id, isbn:isbn, title:title, authors: authors};
    return book;
}


/**
 * Build out a book query object from information in
 * the request body.
 *
 * @param req
 * @returns {{}}
 */
function buildQuery(req) {
    let query = {};
    //console.log(req);
    if (req.query.title) {
        query.title = req.query.title;
    }
    return query;
}

