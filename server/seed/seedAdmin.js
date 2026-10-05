// Run with: npm run seed:admin (from /server)
// Creates (or updates) one initial admin account, so there's a way to log into
// /admin/login before any admin-management UI exists.

require("dotenv").config();
const mongoose = require("mongoose");
const { Admin } = require("../models");

async function seed() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const fullName = process.env.ADMIN_SEED_NAME || "CodeVantage Admin";

  if (!email || !password) {
    console.error(
      "Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in your .env before running this script."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for admin seeding...");

    let admin = await Admin.findOne({ email });
    if (admin) {
      admin.password = password; // pre-save hook re-hashes on save
      admin.fullName = fullName;
      admin.role = "superadmin";
      await admin.save();
      console.log(`Updated existing admin: ${email}`);
    } else {
      admin = await Admin.create({ fullName, email, password, role: "superadmin" });
      console.log(`Created admin: ${email}`);
    }

    console.log("Admin seeding complete. Please log in and consider rotating this password.");
  } catch (err) {
    console.error("Admin seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
