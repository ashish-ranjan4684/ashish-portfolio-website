const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
        host:"smtpout.secureserver.net",
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASSWORD
        }
});

module.exports = {transporter}