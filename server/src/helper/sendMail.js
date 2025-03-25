import nodemailer from "nodemailer";

async function sendMail(email, subject, message) {
    
    let transporter =
    nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD
            }
        }
    );



    let info = await transporter.sendMail({
        from: "Event Management - With AI", // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: message
    });

    return info;
}




export {
    sendMail
}