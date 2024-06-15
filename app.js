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
            // Formatar cada data para YYYY-MM-DD
            const formattedAgendamentos = agendamentos.map(agendamento => {
                const data = new Date(agendamento.data);
                data.setMinutes(data.getMinutes() + data.getTimezoneOffset()); // Ajustar fuso horário se necessário
                const year = data.getFullYear();
                const month = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
                const day = String(data.getDate()).padStart(2, '0');
                const formattedDate = `${day}/${month}/${year}`;

                // Retornar o objeto agendamento com a data formatada
                return {
                    ...agendamento,
                    data: formattedDate
                };
            });

            res.render('admin', { agendamentos: formattedAgendamentos });
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


app.listen(PORT, () => {
    console.log(`Servidor funcionado na porta http://localhost:${PORT}`)
    console.log(`Servidor funcionado na porta http://localhost:${PORT}/admin`)
    })
