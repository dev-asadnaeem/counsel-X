require('dotenv').config();
const mongoose = require('mongoose');
const CryptoToken = require('./model/CryptoToken');
const sendMail = require('./utils/nodeMailer');

mongoose.connect(process.env.MONGODB_STRING)
  .then(async () => {
    console.log("Connected to MongoDB");
    
    const tokens = await CryptoToken.find();
    console.log(`Found ${tokens.length} pending registrations`);
    
    for (const t of tokens) {
      console.log(`\nResending email to: ${t.personalInfo.email}`);
      console.log(`Token: ${t.token}`);
      console.log(`Verify URL: ${process.env.FRONTEND_URL}/register/verify/${t.token}`);
      
      try {
        await sendMail(t.personalInfo.email, t.token, "verify");
        console.log(`✅ Email sent to ${t.personalInfo.email}`);
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
