const nodemailer = require('nodemailer');

// Email configuration
// You need to set these environment variables in your .env file
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // 'gmail', 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD // Your app password (not regular password)
    }
  });
};

// Alternative configuration for custom SMTP
const createCustomTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
    port: process.env.SMTP_PORT || 587, // Usually 587 for TLS or 465 for SSL
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

module.exports = {
  createTransporter,
  createCustomTransporter
};

