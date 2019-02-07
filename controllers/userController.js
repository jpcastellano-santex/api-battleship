var bodyParser = require('body-parser');
var Users = require('../models/userModel');

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api', (req, res, next) => {
        return next();
    });

    // app.get('/api/users/:username', function (req, res) {
    //     console.log(req.url);
    //     Users.find({ username: req.params.username }, (err, result) => {
    //         if (err) throw err;
    //         res.send(result);
    //     });
    // });

    
    app.get('/api/users/:id', function (req, res) {
        Users.findById({ _id: req.params.id }, (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });
}