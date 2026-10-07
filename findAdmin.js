const mongoose = require("mongoose");
const User = require("./model/User");
require("dotenv").config();

async function findAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_STRING);
    console.log("Connected to MongoDB...");

    // Find user with role "admin" and explicitly include password field
    const admin = await User.findOne({ role: "admin" }).select("+personalInfo.password");

    if (admin) {
      console.log("Admin User Found:");
      console.log("-------------------");
      console.log(`Name: ${admin.personalInfo.name}`);
      console.log(`Email: ${admin.personalInfo.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Hashed Password: ${admin.personalInfo.password}`);
    } else {
      console.log("No user with role 'admin' exists in the database.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

findAdmin();
