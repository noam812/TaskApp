
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const welcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: "noamyahud1@gmail.com",
    subject: "Welcome Email",
    text: `Welcome and Thank you for joining us,  ${name}.`,
  };

  sgMail.send(msg); 
};
const cancelationEmail = (email, name) => {
  const msg = {
    to: email,
    from: "noamyahud1@gmail.com",
    subject: "Goodbye Email",
    text: `${name}, Sorry to see you leave our service.Let us know if there is anything you think we should have done differently  .`,
  };

  sgMail.send(msg);
};
module.exports = {
  welcomeEmail,
  cancelationEmail,
};
