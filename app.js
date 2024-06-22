const express = require('express');
const { engine } = require('express-handlebars');
const dotenv = require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
require('./config/auth')(passport);
const bodyParser = require('body-parser');
const Agendamento = require('./models/Agendamento');
const Usuario = require('./models/Usuario');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(session({
    secret: process.env.CHAVE,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

function authenticateMiddleware(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

app.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: false
}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/agendar', (req, res) => {
    res.render('agendar');
});

app.get('/login', (req, res) => {
    res.render('login');
});


// CRIAR USUARIO ADMIN
async function criarUsuarioAdmin() {
    try {
        const email = 'admin@gmail.com';
        const senha = '123';
        const hashSenha = await bcrypt.hash(senha, 10);

        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            console.log('Usuário administrador já existe.');
            return;
        }

        await Usuario.create({ email, senha: hashSenha });
        console.log('Usuário administrador criado com sucesso.');
    } catch (error) {
        console.error('Erro ao criar usuário administrador:', error.message);
    }
}

criarUsuarioAdmin()

// CRIAR AGENDAMENTOS NO BANCO DE DADOS
app.post('/agendar', function (req, res) {
    Agendamento.create({
        nome: req.body.nome,
        telefone: req.body.telefone,
        data: req.body.data,
        horario: req.body.horario,
        servico: req.body.servico
    }).then(function () {
        res.render('home', { Sucesso: "Agendamento concluido!" });
    }).catch(function (erro) {
        res.render('agendar', { erro: "Erro: Agendamento não concluido - " + erro.message });
    });
});

// LER OS AGENDAMENTOS CRIADOS NO BANCO DE DADOS
app.get('/admin',authenticateMiddleware, (req, res) => {
    Agendamento.findAll()
        .then(agendamentos => {
            const agendamentosFormatados = agendamentos.map(agendamento => {
                const data = new Date(agendamento.data);
                data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
                const ano = data.getFullYear();
                const mes = String(data.getMonth() + 1).padStart(2, '0');
                const dia = String(data.getDate()).padStart(2, '0');
                const dataFormatada = `${dia}/${mes}/${ano}`;
                return {
                    ...agendamento, data: dataFormatada
                };
            });
            res.render('admin', { agendamentos: agendamentosFormatados });
        })
        .catch(error => {
            res.render('admin', { erro: "Erro ao buscar agendamentos: " + error.message });
        });
});

// DELETAR AGENDAMENTOS NO BANCO DE DADOS
app.get('/deletar/:id', authenticateMiddleware, function (req, res) {
    Agendamento.destroy({ where: { id: req.params.id } })
        .then(function () {
            res.redirect('/admin');
        }).catch(function (erro) {
            res.send('Erro ao excluir o agendamento');
        });
});

// ATUALIZAR AGENDAMENTOS DO BANCO DE DADOS
app.get('/editar/:id', authenticateMiddleware, (req, res) => {
    const id = req.params.id;
    Agendamento.findByPk(id)
        .then(agendamento => {
            if (agendamento) {
                res.render('editar', { agendamento: agendamento });
            } else {
                res.send('Agendamento não encontrado');
            }
        })
        .catch(error => {
            res.send('Erro ao buscar agendamento: ' + error.message);
        });
});

app.post('/editar/:id', authenticateMiddleware, (req, res) => {
    const id = req.params.id;
    Agendamento.update(
        {
            nome: req.body.nome,
            telefone: req.body.telefone,
            data: req.body.data,
            horario: req.body.horario,
            servico: req.body.servico
        },
        { where: { id: id } }
    ).then(() => {
        res.redirect('/admin');
    }).catch(error => {
        res.send('Erro ao atualizar o agendamento: ' + error.message);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor funcionado na porta http://localhost:${PORT}`);
    console.log(`Servidor funcionado na porta http://localhost:${PORT}/admin`);
});
