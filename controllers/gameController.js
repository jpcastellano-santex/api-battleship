var Games = require('../models/gameModel');
var Users = require('../models/userModel');
var GameBoard = require('../models/gameboardModel');
var bodyParser = require('body-parser');

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/games/', function (req, res) {
        var filters = [];
        if (req.query.owner) {
            filters.push({ 'owner.username': req.query.owner });
        }
        if (req.query.guest) {
            filters.push({ 'guest.username': req.query.guest });
        }
        Games.find({
            $and: filters
        }, function (err, games) {
            if (err) throw err;
            res.send(games);
        });
    });

    app.get('/api/games/user/:username', function (req, res) {
        Games.find({ 'owner.username': req.body.username }, function (err, games) {
            if (err) throw err;
            res.send(games);
        });
    });

    app.post('/api/games', function (req, res) {
        getUserByUserName(req.body.username).then((user) => {
            if (!user) {
                res.send('User not found');// TODO 400
            }
            else {
                var newGame = Games({
                    owner: user,
                    turn: user,
                    createdDate: new Date(),
                    ownerBoard: GameBoard.getRandomBoard(),
                    guestBoard: GameBoard.getRandomBoard()
                });
                newGame.save((err) => {
                    if (err) throw err;
                    res.send('Success');
                });
            }
        });
    });

    app.post('/api/games/:id/cell', function (req, res) {
        Games.findOne({ '_id': req.params.id }, function (err, game) {
            if (err) throw err;
            if (!game) {
                res.send({ value: null, isvalid: false, message: 'Game not found' });
            }
            else if (game.turn.username != req.body.username) {
                res.send({ value: null, isvalid: false, message: 'Its not your turn' });
            }
            else {
                var isOwner = game.owner.username === req.body.username;
                var boardname = isOwner ? 'guestBoard' : 'ownerBoard';
                var cellValue = game[boardname][req.body.row][req.body.col];
                console.log(cellValue,
                    cellValue === GameBoard.cellStatus.HITTED,
                    cellValue === GameBoard.cellStatus.MISS);
                if (cellValue === GameBoard.cellStatus.HITTED || cellValue === GameBoard.cellStatus.MISS) {
                    res.send({ value: cellValue, isvalid: false, message: 'Select other cell' });
                } else {
                    var newCellValue = GameBoard.cellStatus.WATER;
                    if (cellValue === GameBoard.cellStatus.WATER) {
                        newCellValue = GameBoard.cellStatus.MISS;
                    } else {
                        newCellValue = GameBoard.cellStatus.HITTED;
                    }
                    game[boardname][req.body.row][req.body.col] = newCellValue;
                    var nextuser = isOwner ? game.guest : game.owner;
                    var updateObj = { turn: nextuser };
                    updateObj[boardname] = game[boardname];
                    console.log(updateObj);
                    Games.findOneAndUpdate({ '_id': req.params.id },
                        updateObj, { upsert: true }, function (err, updatedGame) {
                            if (err) throw err;
                            console.log(updatedGame[boardname][req.body.row][req.body.col]);
                            res.send({ value: newCellValue, isvalid: true });
                        });
                }
                // res.send({ value: null, isvalid: true });
            }
        });
    });

    app.put('/api/games/:id', function (req, res) {
        Games.findOne({ '_id': req.params.id }, function (err, game) {
            if (err) throw err;
            if (!game) {
                res.send({ value: null, isvalid: false, message: 'Game not found' });
            }
            else {
                if (game.owner.username != req.body.username && (game.guest != null && game.guest.username != req.body.username)) {
                    res.send({ value: null, isvalid: false, message: 'User not found' });
                } else {
                    var isOwner = game.owner.username === req.body.username;
                    if (req.body.surrender) {
                        var winnerUser = isOwner ? game.guest : game.owner;
                        Games.findOneAndUpdate({ '_id': req.params.id }, { $set: { surrender: true, winner: winnerUser } }, { new: true }, function (err, game) {
                            res.send({ value: true, isvalid: true });
                        });
                    } else {
                        if (isOwner) {
                            res.send({ value: null, isvalid: false, message: 'User is owner' });
                        } else {
                            getUserByUserName(req.body.username).then((user) => {
                                if (!user) {
                                    res.send('User not found');// TODO 400
                                } else {
                                    Games.findOneAndUpdate({ '_id': req.params.id }, { $set: { guest: user, startDate: new Date() } }, { new: true }, function (err, game) {
                                        res.send({ value: true, isvalid: true });
                                    });
                                }
                            });
                        }
                    }
                }
            }
        });
    });

    // app.delete('/api/todos', (req, res) => {
    //     Todos.findByIdAndUpdate(req.body.id, (err) => {
    //         if (err) throw err;
    //         res.send('Success');
    //     });
    // });

    getUserByUserName = (username) => {
        return Users.findOne({ username: username }).exec().then((users) => {
            return users;
        }).catch((err) => {
            console.error(err);
            return null;
        });;
    }
}