const nodemailer = require('nodemailer');
const mailConfig = require('../configs/mailConfig');

module.exports = async (options) => {
    //? 1. Create transporter
    const transporter = nodemailer.createTransport(mailConfig);

    //? 2. Define the email options
    const mailOptions = {
        from: 'Ngoc Thuan <ngocthuandn2k@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    //? 3. Actually send the email
    await transporter.sendMail(mailOptions);
};
