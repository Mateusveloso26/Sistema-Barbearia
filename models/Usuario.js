const { Sequelize, DataTypes } = require('sequelize');
const db = require('./db');

const Usuario = db.define('Usuario', {
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    }
   
});
// Usuario.sync ({force:true})
module.exports = Usuario

