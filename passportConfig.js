const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/Usuario'); 

passport.use(new LocalStrategy({

    usernameField: 'email',

    passwordField: 'password'

}, (email, password, done) => {

    User.findOne({ where: { email: email } })

        .then(user => {

            if (!user) {

                return done(null, false, { message: 'Incorrect email.' });

            }
            if (user.password !== password) { // Substitua com hash de senha se estiver usando
                hashing

                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        })
        .catch(err => done(err));

}));

passport.serializeUser((user, done) => {

    done(null, user.id);

});

passport.deserializeUser((id, done) => {

    User.findByPk(id)

        .then(user => {

            done(null, user);

        })

        .catch(err => done(err));

});

module.exports = passport;