// Includes
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

class User {}

// Add password method
User.prototype.vPass = function(password) {
    return true;
}

// export User model for use in other files.
module.exports = User;
