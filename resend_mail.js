const mongoose = require("mongoose");
require("dotenv").config();
const CryptoToken = require("./model/CryptoToken");

mongoose.connect(process.env.MONGODB_STRING || "mongodb://127.0.0.1:27017/counselling-app")
  .then(async () => {
    const tokens = await CryptoToken.find();
    if (tokens.length > 0) {
      console.log("Pending emails in DB:");
      tokens.forEach(t => console.log("- " + t.personalInfo.email));
    } else {
      console.log("❌ DB bilkul empty hai, koi pending registration nahi!");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
