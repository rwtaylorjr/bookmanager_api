/**
 * Created by rotaylor on 8/13/2017.
 */
'use strict';

const chai = require('chai');
const expect = chai.expect;

const SERVER_ROOT = '../../app/server';
const hashUtils = require(SERVER_ROOT + '/hashUtils');


describe('HashUtils Test Suite', (done) =>{

    it ('should hash', (done) =>{
        const unhashed = 'test';
        hashUtils.hash(unhashed).then( (hash) => {
            return hashUtils.compare(unhashed, hash);
        }).then( (result) => {
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });

    it ('should compare', (done) => {
        const unhashed = 'test';
        hashUtils.hash(unhashed).then( (hash) => {
            return hashUtils.compare(unhashed, hash);
        }).then( (result) => {
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });

});