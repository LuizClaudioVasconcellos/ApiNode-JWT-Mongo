const express = require('express');
const authMiddleware = require('../middlewares/auth');
const User = require('../models/user');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    res.send({ ok: true, userId: req.userId});
});

module.exports = app => app.use('/projects', router);