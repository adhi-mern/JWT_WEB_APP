const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

 async function sendVerificationEmail(email, link){
    try{
    await transporter.sendMail({
        from:'"Secure APP" <no-reply@secure.com>',
        to: email,
        subject: "Verify Email",
        html: `
        <h3>Email Verification</h3>
        <p>Click the link below to verify your email:</p>
        <a href="${link}">${link}</a>
        <p>This link expires in 10 minutes.</p>"
      `
    })
   console.log("Email sent to:", email);
  } catch (err) {
    console.error("EMAIL ERROR 👉", err);
    throw err; // rethrow so signup fails
  }
}

module.exports = sendVerificationEmail;