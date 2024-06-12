const { Sequelize, DataTypes } = require('sequelize');
const db = require('./db');

const Agendamento = db.define('Agendamentos', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: DataTypes.DATE,
        allowNull: false
    },
    horario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    servico: {
        type: DataTypes.STRING,
        allowNull: false
    }
});
// Agendamento.sync ({force:true})
module.exports = Agendamento

