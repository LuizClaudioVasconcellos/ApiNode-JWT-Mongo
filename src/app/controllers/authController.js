const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth.json')

const User = require('../models/user');
const req = require('express/lib/request');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
};

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email })) {

            res.status(400).send({ error: 'User already exists' });

        } else {

            const user = await User.create(req.body);

            user.password = undefined;

            return res.send({
                user,
                token: generateToken({ id: user.id }),
            });

        };

    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    };
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).send({ error: 'User not found' });
    };

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password' });
    };

    user.password = undefined;

    res.send({
        user,
        token: generateToken({ id: user.id }),
    });

});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        };

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResteExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'luizvasconcellosjunior@gmail.com',
            // template: '../resources/mail/auth/forgot_password',
            subject: 'Redefinição de senha',
            // context: { token },
            html: `<h1>E-mail para redefinição de senha</h1> <p>Para recuperar sua senha, utilize este token: ${token}</p>`
        }, (err) => {
            if (err) {
                return res.status(400).send({ error: 'Cannot send forgot password email' });
            };

            return res.send();
        });

    } catch (err) {
        res.status(400).send({ error: 'Error on forgot password, try again' });
    }
});

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+passwordResetToken PasswordRestExpires');

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        };

        if (token !== user.passwordResetToken) {
            return res.status(400).send({ error: 'Token invalid' });
        };

        const now = Date();

        if (now > user.passwordResteExpires){
            return res.status(400).send({ error: 'Token expired, generate a new one' });
        };

        user.password = password;

        await user.save();

        return res.send();

    } catch (error) {
        res.status(400).send({ error: 'Cannot reset password, try again' });
    }
});

module.exports = app => app.use('/auth', router);