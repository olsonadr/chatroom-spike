// Includes
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

// Create sequelize instance with local database
var sequelize = new Sequelize('postgres://postgres:password@localhost:5432/chatspike');

// setup User model and its fields.
var User = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
    instanceMethods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    }
});

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// Add password method
User.prototype.vPass = function(password) {
  return bcrypt.compareSync(password, this.password);
}

// export User model for use in other files.
module.exports = User;
