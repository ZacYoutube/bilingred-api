const nodemailer = require('nodemailer');

const sendVerificationEmail = async(email, subject, text) => {
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.REACT_APP_HOST,
            service: process.env.REACT_APP_SERVICE,
            post: Number(process.env.REACT_APP_EMAIL_PORT),
            secure: Boolean(process.env.REACT_APP_SECURE),
            auth:{
                user: process.env.REACT_APP_USER,
                pass: process.env.REACT_APP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.REACT_APP_USER,
            to: email,
            subject: subject,
            text: text
        })

        console.log("send email success");
    }catch(err){
        console.log("send email failed", err);
    }
}


module.exports = { sendVerificationEmail }