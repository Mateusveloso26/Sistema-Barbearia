const express = require('express')
const { engine } = require('express-handlebars')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const app = express()
const Agendamento = require('./models/Agendamento')
const Usuario = require('./models/Usuario')
const PORT = process.env.PORT || 3002;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))

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


// CRIAR AGENDAMENTOS NO BANCO DE DADOS
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

// CRIAÇÃO DO USUARIO ADMIN
// Usuario.create({
//     email: 'admin@gmail.com',
//     senha: 'barber2024' 
// }).then(usuario => {
//     console.log('Usuário criado:', Usuario);
// }).catch(error => {
//     console.error('Erro ao criar usuário:', error);
// })

// LER OS AGENDAMENTOS CRIADOS  NO BANCO DE DADOS
app.get('/admin', (req, res) => {
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
                    ...agendamento,
                    data: dataFormatada
                };
            });
            res.render('admin', { agendamentos: agendamentosFormatados });
        })
        .catch(error => {
            res.render('admin', { erro: "Erro ao buscar agendamentos: " + error.message });
        });
});


// DELETAR AGENDAMENTOS NO BANCO DE DADOS
app.get('/deletar/:id', function (req, res) {
    Agendamento.destroy({ where: { id: req.params.id } })
        .then(function () {
            res.redirect('/admin');

        }).catch(function (erro) {
            res.send('Erro ao excluir o agendamento')
        })
}),

    // ATUALIZAR AGENDAMENTOS DO BANCO DE DADOS
    app.get('/editar/:id', (req, res) => {
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

app.post('/editar/:id', (req, res) => {
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
    console.log(`Servidor funcionado na porta http://localhost:${PORT}`)
    console.log(`Servidor funcionado na porta http://localhost:${PORT}/admin`)
})
