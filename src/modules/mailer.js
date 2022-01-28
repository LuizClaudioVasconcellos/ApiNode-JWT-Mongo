const nodemailer = require('nodemailer');

const { host, port, user, pass } = require('../modules/mail.json');

var transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
  });