/**
 * Created by rotaylor on 7/4/2017.
 */
'use strict'

const chai = require('chai');
const assert = chai.assert;

const SERVER_ROOT = '../../app/server';
const utils = require(SERVER_ROOT + '/utils');

describe ('Utils test suite', function(){
   describe('Test isValidSequence', function(){
        it('undefined is not valid sequence id', function(){
            const id = undefined;
            assert.isNotOk(utils.isValidSequenceId(id), 'undefined is not a valid sequence id');
        });

        it('null is not valid sequence id', function(){
            const id = null;
            assert.isNotOk(utils.isValidSequenceId(id), 'null is not a valid sequence id');
        });

        it('empty string is not valid sequence id', function(){
            const id = '';
            assert.isNotOk(utils.isValidSequenceId(id), 'empty string is not a valid sequence id');
        });

        it('negative integer is not valid sequence id', function(){
            const id = -1;
            assert.isNotOk(utils.isValidSequenceId(id), 'negative integer is not a valid sequence id');
        });

        it('zero is  not a valid sequence id', function(){
            const id = 0;
            assert.isNotOk(utils.isValidSequenceId(id), 'zero is not a valid sequence id');
        });

        it('positive integer is valid sequence id', function(){
            const id = 1;
            assert.isOk(utils.isValidSequenceId(id), 'positive integer is a valid sequence id');
        });

        it('undefined is not valid sequence id', function(){
            assert.isNotOk(utils.isValidSequenceId(), 'undefined is not a valid sequence id');
        });

        it('null is not valid sequence id', function(){
            assert.isNotOk(utils.isValidSequenceId(null), 'null is not a valid sequence id');
        });

        it('alpha character is not valid sequence id', function(){
            assert.isNotOk(utils.isValidSequenceId('y'), 'y is not a valid sequence id');
        });
    });

    describe('Test cloneObject', function(){
        it('Clones object', function(){
            const obj = {};
            const otherObj = utils.cloneObject(obj);
            otherObj.field = 1;
            assert.notEqual(obj, otherObj);
        });
    });

});