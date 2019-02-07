var Users = require('../models/userModel');
var Games = require('../models/gameModel');

module.exports = function (app) {
    app.get('/api/initialize', function (req, res) {
        var dummyUsers = [];
        for (let index = 1; index <= 2; index++) {
            var newUser = {
                username: 'user_' + index,
                password: 'user_' + index
            };
            dummyUsers.push(newUser);
        }
        Users.create(dummyUsers, function (errorUsr, resultUsr) {
            var dummyGames = [];
            var newGame1 = {
                owner: resultUsr[1],
                guest: resultUsr[0]
            };
            dummyGames.push(newGame1);
            var newGame2 = {
                owner: resultUsr[0],
                guest: resultUsr[1]
            };
            dummyGames.push(newGame2);
            Games.create(dummyGames, function (error, resultGames) {
                res.send(resultGames);
            });
        });
    });
}