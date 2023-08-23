import nodeMailer from "nodemailer";

export const sendEmail = async(options) => {
    var transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user:process.env.SMTP_USER ,
          pass: process.env.SMTP_PASSWORD
        }
      });

    const emailOptions = {
        from:process.env.SMPT_USER,
        to:options.email,
        subject:options.subject,
        text:options.message,
    }
    await transporter.sendMail(emailOptions);
}