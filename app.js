const express = require('express')
const { engine } = require('express-handlebars')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const app = express()
const Agendamento = require('./models/Agendamento')

const PORT = process.env.PORT || 3002;

app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.engine('handlebars', engine());

app.set('view engine', 'handlebars');

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home');
})
app.get('/agendar', (req, res) => {
    res.render('agendar');
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.get('/editar/:id', (req, res) => {
    Agendamento.findByPk(req.params.id)
        .then(agendamento => {
            if (agendamento) {
                res.render('editar', { agendamento: agendamento });
            } else {
                res.render('admin', { erro: "Agendamento não encontrado." });
            }
        })
        .catch(error => {
            res.render('admin', { erro: "Erro ao buscar agendamento: " + error.message });
        });
})


// LER  NO BANCO DE DADOS
app.get('/admin', (req, res) => {
    Agendamento.findAll()
        .then(agendamentos => {
            res.render('admin', { agendamentos: agendamentos });
        })
        .catch(error => {
            res.render('admin', { erro: "Erro ao buscar agendamentos: " + error.message });
        });
});


// DELETAR NO BANCO DE DADOS
app.get('/deletar/:id', function (req, res) {
    Agendamento.destroy({ where: { 'id': req.params.id } })
        .then(function () {
            res.send('Cliente deletado com sucesso')

        }).catch(function (erro) {
            res.send('Erro ao excluir o cliente')
        })
}),

// CRIAR  NO BANCO DE DADOS
app.post('/agendar', function (req, res) {
    Agendamento.create({
        nome: req.body.nome,
        telefone: req.body.telefone,
        data: req.body.data,
        horario: req.body.horario,
        servico: req.body.servico
    }).then(function () {
        res.render('/', { Sucesso: "Agendamento concluido !" });
    }).catch(function (erro) {
        res.render('/', { erro: "Erro: Agendamento não concluido - " + erro.message })
    })
})


app.listen(PORT, () => {
    console.log(`Servidor funcionado na porta http://localhost:${PORT}`)
})
