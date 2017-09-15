/**
 * Created by rotaylor on 7/4/2017.
 *
 * General purpose utility module until utilities can be
 * factored out into cohesive module.
 *
 */
'use strict';
const moment = require('moment');
const DATE_FORMAT = 'MM-DD-YYYY';

module.exports =  {
    DATE_FORMAT: DATE_FORMAT,
    isValidSequenceId:isValidSequenceId,
    cloneObject: cloneObject,
    parseDate:parseDate,
    isValidDate:isValidDate
};



function isValidSequenceId(id) {
    return id && Number.isInteger(id) && id >= 0;
}

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function parseDate(dateString) {
    const strictParse = true;
    return moment(dateString, DATE_FORMAT, strictParse).toDate();
}

function isValidDate(date) {
    return moment(date).isValid();
}