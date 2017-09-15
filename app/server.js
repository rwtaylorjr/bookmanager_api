/**
 * Created by rotaylor on 1/12/2017.
 */
'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const swaggerSubPath = express();
const port = process.env.PORT || 3000;
const swagger = require('swagger-node-express').createNew(swaggerSubPath);

module.exports = {
    startUp:startUp,
    init:init,
    getApp:getApp
};


function startUp() {
    init().listen(port,  ()=> {
        console.log('BookManager initialized and  listening on port' + port + '!');
    });
}

function init() {

    // Required for POST requests
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // subpath
    app.use('/V1', swaggerSubPath);

    // mount swagger-ui folder to virtual path
    app.use(express.static(__dirname +'/dist/swagger-ui'));

    swagger.setApiInfo({
        title: "BookManager API",
        description: "API to manage books",
        termsOfServiceUrl: "",
        contact: "yourname@something.com",
        license: "",
        licenseUrl: ""
    });



    require('./server/routes')(app);
    require('./server/errors')(app);

    app.get('/', function (req, res) {
        console.log(__dirname);
        res.sendFile(__dirname + '/dist/swagger-ui/index.html');
    });

    const applicationUrl = 'http://localhost: ' + port;
    swagger.configure(applicationUrl, '1.0.0');

    return app;
}

function getApp() {
    return app;
}






