const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

// in prod check 
// sendgrid 
// mailgun

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});
transporter.use('compile' , hbs({
    viewEngine: {
        extname: '.handlebars',
        layoutsDir: '',
        defaultLayout : false,
    },
    viewPath: "./src/emailTemplates"
}))

const sendPointsConfirmationMail = ({ to , fromEmail , token , url = process.env.REDIRECT_CONFIRMATION_MAIL_LINK} , onEmailFail = () => {}) => {
  var mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,
    to,
    subject: "Confirm Points",
    template: 'confirmPointsEmail',
    context : {
      fromEmail,
        verifyLink : url + "/" + token
    }
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      onEmailFail(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { sendPointsConfirmationMail };
