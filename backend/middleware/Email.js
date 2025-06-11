const transporter = require('./Emailconfig'); // Import the transporter
const { Verification_Email_Template } = require('./EmailTemplate');
require('dotenv').config();

const SendVerificationcode = async (email, verificationCode) => {
    try {
        const info = await transporter.sendMail({
            from: '"kodefactorconsulting 👻" <umesh.lordsp@gmail.com>', // Sender address
            to: email, // Receiver's email address
            subject: 'Verify your email', // Subject line
            text: `Hello, please verify your email. Your code is ${verificationCode}`, // Plain text
            html: Verification_Email_Template.replace("{verificationCode}",verificationCode) // HTML body
        });

        console.log('Message sent successfully:', info.messageId);
       
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { SendVerificationcode };
