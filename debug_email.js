require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("EMAIL:", process.env.EMAIL);
console.log("G_PASS length:", process.env.G_PASS ? process.env.G_PASS.length : "NOT SET");
console.log("NODE_ENV:", process.env.NODE_ENV);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.G_PASS,
  },
});

// Verify connection first
transporter.verify((error, success) => {
  if (error) {
    console.log("CONNECTION FAILED:", error.message);
    process.exit(1);
  }
  
  console.log("Connection OK, sending to ranasammar678@gmail.com...");
  
  transporter.sendMail({
    from: process.env.EMAIL,
    to: "ranasammar678@gmail.com",
    subject: "Verify Your Email - Counsel-X Test",
    html: "<p>Test verification email. If you see this, email is working!</p>"
  }, (err, info) => {
    if (err) {
      console.log("SEND FAILED:", err.message);
      console.log("Error code:", err.code);
      console.log("Response:", err.response);
    } else {
      console.log("SENT SUCCESSFULLY!");
      console.log("Response:", info.response);
      console.log("Message ID:", info.messageId);
      console.log("Check SPAM folder too if not in inbox!");
    }
    process.exit(0);
  });
});
