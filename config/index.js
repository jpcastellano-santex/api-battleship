var defaultValues = require('./config');

module.exports = {
    getDbConnectionString: function () {
        return 'mongodb://' + defaultValues.username + ':' + defaultValues.password + '@ds221435.mlab.com:21435/battleship-jpc';
    }
}