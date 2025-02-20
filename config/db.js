const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI ;

async function connectToDB() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Exit on failure
  }
}

module.exports = connectToDB;
