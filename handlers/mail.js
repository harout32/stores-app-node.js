const nodemailer = require('nodemailer'); //sending the mail and config the SMTP
const pug        = require('pug'); // render the pug file and gives back html
const juice      = require('juice'); // inline the css into the html
const htmlToText = require('html-to-text'); //convert html  to text
const promisify  = require('es6-promisify'); //promisify

//create transport with configuration
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = ( filename, option = {} ) => {
const html         = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, option);
const inlined      = juice(html);
return inlined;
}

//triggering and sending the email
exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from:`harout and <harout@thebest.com>`,
    to: options.user.email,
    subject: options.subject,
    html,
    text
  }
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
}









// transport.sendMail({
//   from: 'haha <haha@ahaha.com>',
//   to: 'rand@example.com',
//   subject: 'Just traing out boys',
//   html: 'Hey I <strong> Love Node</strong> js',
//   text: 'hey  I love node js'
// })