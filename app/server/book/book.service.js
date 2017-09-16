/**
 * Created by rotaylor on 1/22/2017.
 */

'use strict';

const bookDao = require('./book.dao');

module.exports  = {
    findBooks:findBooks,
    getBook:getBook,
    createBook:createBook,
    updateBook:updateBook,
    deleteBooks:deleteBooks,
    deleteAllBooks:deleteAllBooks,
    findBooksByAuthor:findBooksByAuthor
};


function findBooks(query) {
    return bookDao.find(query);
}

function getBook(id) {
    return bookDao.get(id);
}

function createBook(userId, book) {
    return bookDao.create(userId, book);
}

function updateBook(userId, book) {
    return bookDao.update(userId, book);
}

function deleteBooks(ids) {
    return bookDao.remove(ids);

}

function deleteAllBooks() {
    return bookDao.removeAll();
}

function findBooksByAuthor() {

}