const User = require("../model/User");
const bcrypt = require("bcryptjs");

const initAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      console.log("Admin not found. Creating default admin...");
      
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      
      const defaultAdmin = new User({
        personalInfo: {
          name: "System Admin",
          email: "admin@counseling.com",
          password: hashedPassword,
        },
        role: "admin",
        status: "active",
        profile: "dummyImage.png",
      });

      await defaultAdmin.save();
      console.log("------------------------------------------");
      console.log("DEFAULT ADMIN CREATED SUCCESSFULLY");
      console.log("Email: admin@counseling.com");
      console.log("Password: Admin@123");
      console.log("------------------------------------------");
    } else {
      console.log("Admin already exists. Ready to go!");
    }
  } catch (error) {
    console.error("Error during admin initialization:", error);
  }
};

module.exports = { initAdmin };
