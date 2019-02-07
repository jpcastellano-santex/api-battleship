var express = require('express');
var app = express();
var mongoose = require('mongoose');
var config = require('./config');
var initializeController = require('./controllers/initialController');
var userController = require('./controllers/userController');
var gameController = require('./controllers/gameController');

var port = process.env.PORT || 3100;

// app.use('/assets', express.static(__dirname + '/public'));

// app.set('view engine', 'ejs');

mongoose.connect(config.getDbConnectionString());

initializeController(app);
userController(app);
gameController(app);

app.listen(port);