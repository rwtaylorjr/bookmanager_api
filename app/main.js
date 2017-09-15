/**
 * Created by rotaylor on 7/28/2017.
 */
'use strict';

const server = require('./server');
const db = require('./server/db');
try {
    db.startUp().then(()=>{
        server.startUp();
    }).catch( (err) => {
        console.log('An error occurred starting BookManager. Shutting down...', err);
        db.shutDown();
    });
} catch(err) {
    console.log(err);
}
