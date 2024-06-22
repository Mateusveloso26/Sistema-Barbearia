const Sequelize = require('sequelize')
const sequelize = new Sequelize('barbearia', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
})

sequelize.authenticate().then(function () {
    console.log("Conectado")
}).catch(function (erro) {
    console.log("Erro ao se conectar" + erro)
}) 

module.exports = sequelize;
