const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");
const Blog = require("./src/models/Blog");
const Inquiry = require("./src/models/Inquiry");
const User = require("./src/models/User");

// Load env
dotenv.config();

const clearDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection established for cleanup.");

    // Delete existing records
    await Product.deleteMany({});
    console.log("Cleared all Products.");

    await Category.deleteMany({});
    console.log("Cleared all Categories.");

    await Blog.deleteMany({});
    console.log("Cleared all Blogs.");

    await Inquiry.deleteMany({});
    console.log("Cleared all Inquiries.");

    await User.deleteMany({});
    console.log("Cleared all Users.");

    // Recreate clean admin user
    const email = "admin@zurienterprises.com";
    const admin = await User.create({
      name: "Zuri Administrator",
      email: email,
      password: "adminpassword", // Will be hashed by pre-save hook
      company: "ZURI ENTERPRISES",
      phone: "+91 75062 51326",
      role: "admin"
    });

    console.log("Admin account successfully recreated!");
    console.log(`Email: ${admin.email}`);
    console.log("Password: adminpassword");

    console.log("Database successfully cleaned and reset for deployment!");
    process.exit(0);
  } catch (error) {
    console.error(`Database cleanup failed: ${error.message}`);
    process.exit(1);
  }
};

clearDB();
