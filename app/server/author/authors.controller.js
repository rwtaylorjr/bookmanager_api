/**
 * Created by rotaylor on 1/15/2017.
 * Revealing Module Pattern
 */

'use strict';
const HttpStatus = require('http-status-codes');
const authorService = require('./author.service');
const bookService = require('../book/book.service');
const utils = require('../utils');
const InvalidRequestError = require('../errors/invalid-request-error');
const INVALID_AUTHOR_IDS = 'Invalid author ids. All author ids must be positive integer values.';

module.exports = {
    INVALID_AUTHOR_IDS: INVALID_AUTHOR_IDS,
    findAuthors:findAuthors,
    getAuthor:getAuthor,
    createAuthor:createAuthor,
    updateAuthor:updateAuthor,
    deleteAuthors:deleteAuthors,
    validateCreate:validateCreate,
    validateUpdate:validateUpdate,
    validateDelete:validateDelete,
    toAuthor:toAuthor,
    buildQuery:buildQuery
};


/**
 * Find authors with the specified query parameters
 * in the request.
 *
 * @param req
 * @param res
 * @param next
 */
function findAuthors(req, res, next) {
    const query = buildQuery(req);
    authorService.findAuthors(query)
        .then(function(authors){
            res.status(HttpStatus.OK).json(authors);
        }).catch((err) => {
            //console.log(err);
            next(err);
        });
}

/**
 * Get the author corresponding to req.param.id
 * Assert that the req.param.id will be a valid sequence id
 *
 * @param req
 * @param res
 * @param next
 */
function getAuthor(req, res, next) {
    //console.log('getAuthor...', req);
    const id = parseInt(req.params.id);
    //console.log('authorId: ' + id);
    authorService.getAuthor(id)
        .then(function(author){
            res.status(HttpStatus.OK).json(author); // default status: 200
        }).catch(next);
}

/**
 * Create a new author with the specified author information
 * in the request body.
 *
 * @param req
 * @param res
 * @param next
 */
function createAuthor(req, res, next) {
    const author = req.author;
    const userId = req.user._id;
    authorService.createAuthor(userId, author).then((id) => {
        const payload = {authorId:id};
            res.status(HttpStatus.CREATED).json(payload); // with id populated
        }).catch(next);
}

/**
 * Update the author with the specified author information
 * in the request body
 *
 * @param req
 * @param res
 * @param next
 */
function updateAuthor(req, res, next) {
    const author = req.author;
    const userId = req.user._id;
    authorService.updateAuthor(userId, author)
        .then(function(b){
            const payload = {success:true};
            res.status(HttpStatus.OK).json(payload);
        }).catch(next);
}

/**
 * Delete the authors corresponding to the author ids
 * in the request body.
 *
 * @param req
 * @param res
 * @param next
 */
function deleteAuthors(req, res, next) {
    let ids = req.body.ids;
    authorService.deleteAuthors(ids).then(() => {
        res.status(HttpStatus.OK).json(); // deleted authors
    }).catch(next);

}

/**
 * Validate the create request.
 * If invalid, set error in next, otherwise
 * parse request into author and set it on the request to be used
 * down stream by the create handler
 *
 * @param req
 * @param res
 * @param next
 */
function validateCreate(req, res, next) {
    const payload = req.body;
    if (!payload.name) {
        next(InvalidRequestError.newParamValidationError('name'));
    } else if (!payload.dob) {
        next(InvalidRequestError.newParamValidationError('dob'));
    } else {
        const parsedDate = utils.parseDate(req.body.dob);
        if (!utils.isValidDate(parsedDate)) {
            next(InvalidRequestError.newParamValidationError('dob'));
        } else {
            req.body.dob = parsedDate;
        }
        req.author = toAuthor(req);
        next();
    }
}

/**
 * Validate the update request.
 * If invalid, set error in next, otherwise
 * parse request into author and set it on the request to be used
 * down stream by the update handler
 *
 * @param req
 * @param res
 * @param next
 */
function validateUpdate(req, res, next) {
    const payload = req.body;
    const strictParse = true;
    if (!payload.id || !utils.isValidSequenceId(payload.id)) {
        next(InvalidRequestError.newParamValidationError('id'));
    } else if (!payload.name) {
        next(InvalidRequestError.newParamValidationError('name'));
    } else if (!payload.dob) {
        next(InvalidRequestError.newParamValidationError('dob'));
    } else {
        const parsedDate = utils.parseDate(req.body.dob);
        if (!utils.isValidDate(parsedDate)) {
            next(InvalidRequestError.newParamValidationError('dob'));
        } else {
            req.body.dob = parsedDate;
        }

        req.author = toAuthor(req);
        next();
    }
}

/**
 * Validate delete request.
 *
 * If invalid, set error in next, otherwise
 * parse request into author and set it on the request to be used
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
            let query = {authors:payload.ids};
            bookService.findBooks(query).then((results)=>{
                // Can't delete authors because they are referenced in existing books
                if (results && results.length > 0) {
                    res.status(HttpStatus.METHOD_NOT_ALLOWED).json(results);
                } else {
                    next();
                }
            }).catch(next);

        } else {
            next(new InvalidRequestError(INVALID_AUTHOR_IDS));
        }

    } else {
        next();
    }
}

/**
 * Transform the req body information into a author model.
 *
 * @param req
 * @returns {{_id: (number|null), isbn: (string|null), title: (string|string|null), authors: Array}}
 */
function toAuthor(req) {
    // TODO: Look into use Object.assign(...)
    let body = req.body;
    const id = parseInt(body.id) || null;
    const name = body.name || null;
    const strictParse = true;
    let dob = body.dob || null;
    if (dob) {
        dob = utils.parseDate(dob);
    }
    const author = {_id:id, name:name, dob:dob};
    return author;
}

/**
 * Build out a author query object from information in
 * the request body.
 *
 * @param req
 * @returns {{}}
 */
function buildQuery(req) {
    let query = {};
    //console.log(req);
    if (req.query.name) {
        query.name = req.query.name;
    }
    return query;
}

