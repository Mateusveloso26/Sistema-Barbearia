const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'usuarios', // nome da tabela no banco de dados
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.senha) {
                const salt = await bcrypt.genSalt(10);
                usuario.senha = await bcrypt.hash(usuario.senha, salt);
            }
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('senha')) { // verificar se a senha foi alterada
                const salt = await bcrypt.genSalt(10);
                usuario.senha = await bcrypt.hash(usuario.senha, salt);
            }
        },
    },
});

module.exports = Usuario;
