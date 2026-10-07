const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./model/User");
const CryptoToken = require("./model/CryptoToken");

mongoose.connect(process.env.MONGODB_STRING || "mongodb://127.0.0.1:27017/counselling-app")
  .then(async () => {
    // Attempt to delete from User collection
    const resultUser = await User.deleteMany({ "personalInfo.email": { $regex: "123asadnaeem", $options: "i" } });
    console.log(`Deleted from User collection: ${resultUser.deletedCount}`);

    // Attempt to delete from CryptoToken collection
    const resultToken = await CryptoToken.deleteMany({ "personalInfo.email": { $regex: "123asadnaeem", $options: "i" } });
    console.log(`Deleted from CryptoToken collection: ${resultToken.deletedCount}`);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
