const express = require('express')
const { engine } = require('express-handlebars')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const app = express()
const Agendamento = require('./models/Agendamento')
const session = require('express-session')
const passport = require('./passportConfig')

const PORT = process.env.PORT || 3002;

app.use(session({ // Configuração do express-session
    secret: 'your_secret_key', // Substitua por uma chave secreta real
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('public'))

app.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: false

}));


app.get('/', (req, res) => {
    res.render('home');
})
app.get('/agendar', (req, res) => {
    res.render('agendar');
})

app.get('/login', (req, res) => {
    res.render('login')
})


// CRIAR  NO BANCO DE DADOS
app.post('/agendar', function (req, res) {
    Agendamento.create({
        nome: req.body.nome,
        telefone: req.body.telefone,
        data: req.body.data,
        horario: req.body.horario,
        servico: req.body.servico
    }).then(function () {
        res.render('home', { Sucesso: "Agendamento concluido !" });
    }).catch(function (erro) {
        res.render('agendar', { erro: "Erro: Agendamento não concluido - " + erro.message })
    })
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
    Agendamento.destroy({ where: { id: req.params.id } })
        .then(function () {
            res.redirect('/admin');

        }).catch(function (erro) {
            res.send('Erro ao excluir o agendamento')
        })
}),

// ATUALIZAR DADOS NO BANCO DE DADOS
app.post('/atualizar/:id', (req, res) => {
    const id = req.params.id;

    Agendamento.findByPk(id).then(agendamento => {
        if (agendamento) {
            agendamento.nome = req.body.nome;
            agendamento.telefone = req.body.telefone;
            agendamento.data = req.body.data;
            agendamento.horario = req.body.horario;
            agendamento.servico = req.body.servico;

            return agendamento.save().then(() => {
                res.send({ message: 'Agendamento atualizado com sucesso' });
            });
        } else {
            res.send({ message: 'Agendamento não encontrado' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor funcionado na porta http://localhost:${PORT}`)
    console.log(`Servidor funcionado na porta http://localhost:${PORT}/admin`)
})
