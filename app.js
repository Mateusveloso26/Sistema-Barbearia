
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');

const sequelize = require('./config/db');
const bcrypt = require('bcryptjs');

const Agendamento = require('./models/Agendamento');
const Cliente = require('./models/Cliente');
const Admin = require('./models/Admin');

const passport = require('passport');
const session = require('express-session');
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

function isAdminAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/loginAdmin');
}


app.post('/loginAdmin', passport.authenticate('admin-local', {
    successRedirect: '/admin',
    failureRedirect: '/loginAdmin',
    failureFlash: false
}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/agendar', (req, res) => {
    res.render('agendar');
});

app.get('/loginAdmin', (req, res) => {
    res.render('loginAdmin');
});

app.get('/loginUsuario', (req, res) => {
    res.render('loginUsuario');
});

app.get('/loginUsuarioNovo', (req, res) => {
    res.render('loginUsuarioNovo');
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// CRIAR USUARIO ADMIN
async function criarAdmin() {
    try {
        const email = 'admin@gmail.com';
        const senha = '1234';
        const hashSenha = await bcrypt.hash(senha, 10);

        const adminExistente = await Admin.findOne({ where: { email } });
        if (adminExistente) {
            console.log('Usuário administrador já existe.');
            return;
        }

        await Admin.create({ email, senha: hashSenha });
        console.log('Usuário administrador criado com sucesso.');
    } catch (error) {
        console.error('Erro ao criar usuário administrador:', error.message);
    }
}
criarAdmin();

// CRIAR CLIENTES NO BANCO DE DADOS
app.post('/loginUsuarioNovo', async (req, res) => {
    const { nome, email, cpf, telefone, senha } = req.body;

    try {
        // Verifique se o usuário já existe pelo email
        const usuarioExistente = await Cliente.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.render('loginUsuarioNovo', { errorMessage: 'Email já cadastrado.' });
        }
        // Crie um novo usuário
        const hashSenha = await bcrypt.hash(senha, 10);
        await Cliente.create({ nome, email, cpf, telefone, senha: hashSenha });

        // Redirecione para a página de login após criar a conta com sucesso
        res.render('loginUsuario', { Sucesso: 'Conta criada com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        res.render('loginUsuarioNovo', { erro: 'Erro ao criar usuário. Tente novamente mais tarde.' });
    }
});

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
app.get('/admin', isAdminAuthenticated, (req, res) => {
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
app.get('/editar/:id', isAdminAuthenticated, (req, res) => {
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

app.post('/editar/:id', isAdminAuthenticated, (req, res) => {
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
app.get('/deletar/:id', isAdminAuthenticated, function (req, res) {
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
    console.log(`Servidor funcionando na porta http://localhost:${PORT}/loginUsuario`);
});