// Includes
import Sequelize, { STRING } from 'sequelize';
import { genSaltSync, hashSync, compareSync } from 'bcrypt';

// Create sequelize instance with local database
var sequelize = new Sequelize('postgres://postgres:password@localhost:5432/chatspike');

// setup User model and its fields.
var User = sequelize.define('users', {
    username: {
        type: STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: STRING,
        allowNull: false
    }
}, {
    hooks: {
      beforeCreate: (user) => {
        const salt = genSaltSync();
        user.password = hashSync(user.password, salt);
      }
    },
    instanceMethods: {
      validPassword: function(password) {
        return compareSync(password, this.password);
      }
    }
});

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// Add password method
User.prototype.vPass = function(password) {
  return compareSync(password, this.password);
}

// export User model for use in other files.
export default User;
