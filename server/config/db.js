const mongoose = require("mongoose");
const ensureDefaultContent = require("../utils/ensureDefaultContent");
const ensureDefaultCertificateContent = require("../utils/ensureDefaultCertificateContent");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await ensureDefaultContent();
    await ensureDefaultCertificateContent();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
