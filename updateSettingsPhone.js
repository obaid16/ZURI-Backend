const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Settings = require("./src/models/Settings");

dotenv.config();

const updatePhone = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ phone: "+91 75062 51326" });
      console.log("Settings document created with phone: +91 75062 51326");
    } else {
      settings.phone = "+91 75062 51326";
      await settings.save();
      console.log("Settings document updated with phone: +91 75062 51326");
    }
    process.exit(0);
  } catch (error) {
    console.error("Failed to update settings phone:", error.message);
    process.exit(1);
  }
};

updatePhone();
