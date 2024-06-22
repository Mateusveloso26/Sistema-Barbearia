const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const Usuario = require('../models/Usuario');

module.exports = function(passport) {
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'senha'
    }, async (email, senha, done) => {
        try {
            console.log('Tentativa de autenticação para o email:', email);

            const user = await Usuario.findOne({ where: { email } });

            if (!user) {
                console.log('Usuário não encontrado:', email);
                return done(null, false, { message: 'Usuário não encontrado.' });
            }

            console.log('Usuário encontrado:', user);

            const senhaSemEspacos = senha.trim();

            const isValid = await bcrypt.compare(senhaSemEspacos, user.senha);

            console.log('Senha digitada:', senhaSemEspacos);
            console.log('Senha armazenada:', user.senha);
            console.log('Comparação de senhas válida?', isValid);

            if (!isValid) {
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

};