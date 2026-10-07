const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("EMAIL:", process.env.EMAIL);
console.log("G_PASS:", process.env.G_PASS ? "SET (" + process.env.G_PASS.length + " chars)" : "NOT SET");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.G_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email Connection FAILED:", error.message);
  } else {
    console.log("✅ Email Connection SUCCESS! Server is ready to send emails.");
    // Send test email
    transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "Test Email - Counselling App",
      html: "<p>Yeh test email hai. Email kaam kar rahi hai!</p>"
    }, (err, info) => {
      if (err) {
        console.log("❌ Send FAILED:", err.message);
      } else {
        console.log("✅ Test Email SENT! Check inbox:", info.response);
      }
      process.exit(0);
    });
  }
});
