const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} [options.html] - Optional HTML content
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log(` Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
};

module.exports = { sendEmail };
