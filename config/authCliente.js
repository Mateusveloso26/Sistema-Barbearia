const bcrypt = require('bcryptjs');
const localStrategy = require('passport-local').Strategy;
const Cliente = require('../models/Cliente');

module.exports = function (passport) {
    passport.use('cliente-local',new localStrategy({
        usernameField: 'email',
        passwordField: 'senha'
    }, async (email, senha, done) => {
        try {
            console.log('Tentativa de autenticação para o email:', email);

            // Procurar o usuário pelo email no banco de dados
            const user = await Cliente.findOne({ where: { email } });

            if (!user) {
                console.log('Usuário não encontrado para o email:', email);
                return done(null, false, { message: 'Usuário não encontrado.' });
            }

            console.log('Usuário encontrado:', user);

            // Comparar a senha fornecida com a senha armazenada utilizando bcrypt
            const isValidPassword = await bcrypt.compare(senha, user.senha);

            console.log('Senha digitada:', senha);
            console.log('Senha armazenada no banco:', user.senha);
            console.log('Comparação de senhas válida?', isValidPassword);

            if (!isValidPassword) {
                console.log('Senha incorreta para o email:', email);
                return done(null, false, { message: 'Senha incorreta.' });
            }

            console.log('Autenticação bem-sucedida para o email:', email);
            return done(null, user);
        } catch (error) {
            console.error('Erro durante a autenticação:', error);
            return done(error, false);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await Cliente.findByPk(id);
            done(null, user);
        } catch (error) {
            console.error('Erro ao desserializar o usuário:', error);
            done(error, null);
        }
    });
};
