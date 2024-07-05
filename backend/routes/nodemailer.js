const nodemailer = require('nodemailer');

// Create a transporter object with your SMTP server details
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' for Gmail, or configure your own SMTP service
  auth: {
    user: 'triviatechnology2024@gmail.com', 
    pass: 'unpg lgmc akgd xmms'// Consider using environment variables for sensitive information
  }
});

// Function to send email
const sendEmail = (to, subject, text) => {
  const mailOptions = { 
    from: 'triviatechnology2024@gmail.com', 
    to: to,
    subject: subject,
    text: text
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
};

module.exports = { sendEmail };