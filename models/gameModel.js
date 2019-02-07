var mongoose = require('mongoose');
var Users = require('./userModel');

var Schema = mongoose.Schema;

var gameSchema = new Schema({
    // username: String,
    // password: String
    owner: Users.schema,
    guest: Users.schema,
    turn: Users.schema,
    winner: Users.schema,
    createdDate: Date,
    startDate: Date,
    endDate: Date,
    surrender: Boolean,
    ownerBoard: [[Number]],
    guestBoard: [[Number]]
});

var Games = mongoose.model('Games', gameSchema);

module.exports = Games;