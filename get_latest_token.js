const mongoose = require('mongoose');
require('dotenv').config();
const CryptoToken = require('./model/CryptoToken');

mongoose.connect(process.env.MONGODB_STRING || 'mongodb://127.0.0.1:27017/counselling-app')
  .then(async () => {
    const latestTokens = await CryptoToken.find().sort({ createdAt: -1 }).limit(1);
    if (latestTokens.length > 0) {
      console.log('LATEST_TOKEN:', latestTokens[0].token);
      console.log('USER_EMAIL:', latestTokens[0].personalInfo.email);
    } else {
      console.log('NO_TOKENS_FOUND');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
