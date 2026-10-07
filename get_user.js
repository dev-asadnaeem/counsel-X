const mongoose = require("mongoose");
const User = require("./model/User");

mongoose.connect("mongodb://127.0.0.1:27017/counselling-app").then(async () => {
  try {
    const counselors = await User.find({ role: "counselor" }).populate("counseling");
    console.log("Counselors count:", counselors.length);
    counselors.forEach(c => {
      console.log("Counselor ID:", c._id.toString());
      console.log("Counseling profile:", c.counseling ? { price: c.counseling.price, duration: c.counseling.duration } : null);
    });
  } catch (err) { console.error(err); }
  process.exit(0);
});
