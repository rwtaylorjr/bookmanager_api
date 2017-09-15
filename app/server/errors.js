/**
 * Created by rotaylor on 7/3/2017.
 */
module.exports = function(app) {
    'use strict';
    var HttpStatus = require('http-status-codes');
    app.use(function(err, req, res, next) {
        let exposedError = app.get('env') === 'development'? err:{};

        res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        res.json({
            message: err.message,
            error: exposedError
        });
        //console.log(err);
    });



}
