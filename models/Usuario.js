const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

// Usuario.sync({ force: true }); 
module.exports = Usuario;
