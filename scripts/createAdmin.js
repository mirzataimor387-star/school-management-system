import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";


// 🔥 FIXED PATH
dotenv.config({ path: "../.env" });
async function createAdmin() {
  try {
    // safety check
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    // connect DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // check existing admin
    const existingAdmin = await User.findOne({
      email: "superadmin@asian.com",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    // hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // create admin user
    const admin = await User.create({
      name: "Super Admin",
      email: "superadmin@asian.com",
      password: hashedPassword,
      role: "superadmin",
    });


    console.log("✅ Admin created successfully");
    console.log({
      email: admin.email,
      password: "123456",
      role: admin.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin creation failed:");
    console.error(error.message);
    process.exit(1);
  }
}

createAdmin();
