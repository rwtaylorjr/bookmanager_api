/**
 * Created by rotaylor on 1/22/2017.
 */

'use strict';

const authorDao = require('./author.dao');
const bookService = require('../book/book.service');

module.exports  = {
    findAuthors:findAuthors,
    getAuthor:getAuthor,
    createAuthor:createAuthor,
    updateAuthor:updateAuthor,
    deleteAuthors:deleteAuthors,
    deleteAllAuthors:deleteAllAuthors
};


function findAuthors(query) {
    return authorDao.find(query);
}

function getAuthor(id) {
    return authorDao.get(id);
}

function createAuthor(userId, author) {
    return authorDao.create(userId, author);
}

function updateAuthor(userId, author) {
    return authorDao.update(userId, author);
}

function deleteAuthors(ids) {
    return authorDao.remove(ids);
}


function deleteAllAuthors() {
    return authorDao.removeAll();
}

