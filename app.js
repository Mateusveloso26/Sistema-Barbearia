const dotenv = require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const Usuario = require('./models/Usuario');
const Agendamento = require('./models/Agendamento');
require('./config/auth')(passport);

const app = express();
const PORT = process.env.PORT || 3333;

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

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// CRIAR USUARIO ADMIN
async function criarUsuarioAdmin() {
    try {
        const email = 'teste@gmail.com';
        const senha = 'teste';
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

// criarUsuarioAdmin();

// CRIAR AGENDAMENTOS NO BANCO DE DADOS
app.post('/agendar', function (req, res) {
    Agendamento.create({
        nome: req.body.nome,
        telefone: req.body.telefone,
        data: req.body.data,
        horario: req.body.horario,
        servico: req.body.servico
    }).then(function () {
        res.render('home', { Sucesso: "Agendamento concluído!" });
    }).catch(function (erro) {
        res.render('agendar', { erro: "Erro: Agendamento não concluído - " + erro.message });
    });
});

// LER OS AGENDAMENTOS CRIADOS NO BANCO DE DADOS
app.get('/admin', authenticateMiddleware, (req, res) => {
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
                    id: agendamento.id,
                    nome: agendamento.nome,
                    telefone: agendamento.telefone,
                    data: dataFormatada,
                    horario: agendamento.horario,
                    servico: agendamento.servico
                };
            });
            res.render('admin', { agendamentos: agendamentosFormatados });
        })
        .catch(error => {
            res.render('admin', { erro: "Erro ao buscar agendamentos: " + error.message });
        });
});


// EXIBIR OS DADOS NO INPUT E ATUALIZAR OS DADOS
app.get('/editar/:id', authenticateMiddleware, (req, res) => {
    const id = req.params.id;
    Agendamento.findByPk(id)
        .then(agendamento => {
            if (agendamento) {

                const plainAgendamento = agendamento.get({ plain: true });

                const data = new Date(plainAgendamento.data);
                data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
                const ano = data.getFullYear();
                const mes = String(data.getMonth() + 1).padStart(2, '0');
                const dia = String(data.getDate()).padStart(2, '0');
                const dataFormatada = `${ano}-${mes}-${dia}`;

                plainAgendamento.data = dataFormatada;

                res.render('editar', { agendamento: plainAgendamento });
            } else {
                res.status(404).send('Agendamento não encontrado');
            }
        })
        .catch(error => {
            res.status(500).send('Erro ao buscar agendamento: ' + error.message);
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
        res.status(500).send('Erro ao atualizar o agendamento: ' + error.message);
    });
});

// DELETAR AGENDAMENTOS NO BANCO DE DADOS
app.get('/deletar/:id', function (req, res) {
    Agendamento.destroy({ where: { id: req.params.id } })
        .then(function () {
            res.redirect('/admin');
        }).catch(function (erro) {
            res.send('Erro ao excluir o agendamento');
        });
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando na porta http://localhost:${PORT}`);
    console.log(`Servidor funcionando na porta http://localhost:${PORT}/admin`);
});
