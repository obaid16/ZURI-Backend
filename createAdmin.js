const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection established.");

    const email = "admin@zurienterprises.com";
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email });
    if (adminExists) {
      console.log(`Admin user with email ${email} already exists!`);
      process.exit(0);
    }

    const admin = await User.create({
      name: "Zuri Administrator",
      email: email,
      password: "adminpassword", // Will be hashed by pre-save hook
      company: "ZURI ENTERPRISES",
      phone: "+91 75062 51326",
      role: "admin"
    });

    console.log("Admin account successfully created!");
    console.log(`Email: ${admin.email}`);
    console.log("Password: adminpassword");
    process.exit(0);
  } catch (error) {
    console.error(`Failed to create admin: ${error.message}`);
    process.exit(1);
  }
};

createAdminUser();
